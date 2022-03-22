use super::{
    consolidate::{Consolidate, ConsolidateContext},
    consolidate_parameters::ConsolidateParameters,
    context::SynthesizerContext,
    suppress::Suppress,
    synthesis_data::SynthesisData,
    typedefs::{
        AttributeCountMap, AvailableAttrsMap, NotAllowedAttrSet, SynthesizedRecord,
        SynthesizedRecords, SynthesizedRecordsSlice,
    },
};
use std::sync::Arc;

use crate::{
    data_block::{block::DataBlock, value::DataBlockValue},
    processing::aggregator::value_combination::ValueCombination,
    utils::{math::calc_percentage, reporting::ReportProgress},
};

/// Represents all the information required to perform the synthesis from aggregates
/// (useful in the differential privacy context)
pub struct FromAggregatesSynthesizer {
    /// Reference to the original data block
    data_block: Arc<DataBlock>,
    /// Reporting resolution used for data synthesis
    resolution: usize,
    /// Maximum cache size allowed
    cache_max_size: usize,
    /// Parameters used for data consolidation
    consolidate_parameters: ConsolidateParameters,
    /// Cached single attribute counts
    single_attr_counts: AttributeCountMap,
    /// Percentage already completed on the consolidation step
    consolidate_percentage: f64,
    /// Percentage already completed on the suppression step
    suppress_percentage: f64,
}

impl FromAggregatesSynthesizer {
    /// Returns a new FromAggregatesSynthesizer
    /// # Arguments
    /// * `data_block` - Sensitive data to be synthesized
    /// * `resolution` - Reporting resolution used for data synthesis
    /// * `cache_max_size` - Maximum cache size allowed
    /// * `consolidate_parameters` - Parameters used for data consolidation
    #[inline]
    pub fn new(
        data_block: Arc<DataBlock>,
        resolution: usize,
        cache_max_size: usize,
        consolidate_parameters: ConsolidateParameters,
    ) -> FromAggregatesSynthesizer {
        FromAggregatesSynthesizer {
            data_block,
            resolution,
            cache_max_size,
            single_attr_counts: consolidate_parameters
                .aggregated_data
                .aggregates_count
                .iter()
                .filter_map(|(attr, count)| {
                    if attr.len() == 1 {
                        Some((attr[0].clone(), count.count))
                    } else {
                        None
                    }
                })
                .collect(),
            consolidate_parameters,
            consolidate_percentage: 0.0,
            suppress_percentage: 0.0,
        }
    }

    /// Performs the synthesis from the aggregates, including the consolidation and suppression
    /// steps only
    /// Returns the synthesized records
    /// # Arguments
    /// * `progress_reporter` - Will be used to report the processing
    /// progress (`ReportProgress` trait). If `None`, nothing will be reported
    pub fn run<T>(&mut self, progress_reporter: &mut Option<T>) -> SynthesizedRecords
    where
        T: ReportProgress,
    {
        let mut synthesized_records: SynthesizedRecords = SynthesizedRecords::new();

        if !self.data_block.records.is_empty() {
            let mut context = SynthesizerContext::new(
                self.data_block.clone(),
                self.resolution,
                self.cache_max_size,
            );

            self.consolidate_percentage = 0.0;
            self.suppress_percentage = 0.0;

            self.consolidate(
                &mut synthesized_records,
                progress_reporter,
                &mut context,
                self.consolidate_parameters.clone(),
            );
            self.suppress(&mut synthesized_records, progress_reporter);
        }
        synthesized_records
    }

    #[inline]
    fn calc_overall_progress(&self) -> f64 {
        self.consolidate_percentage * 0.7 + self.suppress_percentage * 0.3
    }
}

impl SynthesisData for FromAggregatesSynthesizer {
    #[inline]
    fn get_data_block(&self) -> &Arc<DataBlock> {
        &self.data_block
    }

    #[inline]
    fn get_single_attr_counts(&self) -> &AttributeCountMap {
        // get all the single attribute counts
        // from the aggregate counts
        &self.single_attr_counts
    }

    #[inline]
    fn get_resolution(&self) -> usize {
        self.resolution
    }
}

impl Consolidate for FromAggregatesSynthesizer {
    #[inline]
    fn get_not_used_attrs(
        &self,
        _synthesized_records: &SynthesizedRecordsSlice,
    ) -> AvailableAttrsMap {
        // get all the single attribute counts
        // from the aggregate counts
        self.consolidate_parameters
            .aggregated_data
            .aggregates_count
            .iter()
            .filter_map(|(attr, count)| {
                if attr.len() == 1 {
                    Some((attr[0].clone(), count.count as isize))
                } else {
                    None
                }
            })
            .collect()
    }

    #[inline]
    fn sample_next_attr(
        &self,
        synthesizer_context: &mut SynthesizerContext,
        consolidate_context: &ConsolidateContext,
        last_processed: &ValueCombination,
        synthesized_record: &SynthesizedRecord,
        not_allowed_attr_set: &NotAllowedAttrSet,
    ) -> Option<Arc<DataBlockValue>> {
        synthesizer_context.sample_next_attr_from_aggregates(
            consolidate_context,
            last_processed,
            synthesized_record,
            not_allowed_attr_set,
            &self.consolidate_parameters,
        )
    }

    #[inline]
    fn update_consolidate_progress<T>(
        &mut self,
        n_processed: usize,
        total: f64,
        progress_reporter: &mut Option<T>,
    ) where
        T: ReportProgress,
    {
        if let Some(r) = progress_reporter {
            self.consolidate_percentage = calc_percentage(n_processed as f64, total);
            r.report(self.calc_overall_progress());
        }
    }
}

impl Suppress for FromAggregatesSynthesizer {
    #[inline]
    fn update_suppress_progress<T>(
        &mut self,
        n_processed: usize,
        total: f64,
        progress_reporter: &mut Option<T>,
    ) where
        T: ReportProgress,
    {
        if let Some(r) = progress_reporter {
            self.suppress_percentage = calc_percentage(n_processed as f64, total);
            r.report(self.calc_overall_progress());
        }
    }
}