use sds_core::data_block::DataBlockValue;
use std::{str::FromStr, sync::Arc};

use crate::utils::{assert_map_equals, read_test_data_block};

const DELIMITER: u8 = b',';

const TEST_FILE_PATH: &str = "test_block.csv";

#[test]
fn validate_calc_column_index_by_name() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_map_equals(
        &db.calc_column_index_by_name(),
        &[
            ("A".to_owned(), 0),
            ("B".to_owned(), 1),
            ("C".to_owned(), 2),
            ("D".to_owned(), 3),
        ]
        .iter()
        .cloned()
        .collect(),
    );
}

#[test]
fn validate_calc_attr_rows() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_map_equals(
        &db.calc_attr_rows(),
        &[
            (
                Arc::new(DataBlockValue::from_str("0:a1").unwrap()),
                vec![0, 2],
            ),
            (Arc::new(DataBlockValue::from_str("1:b1").unwrap()), vec![0]),
            (Arc::new(DataBlockValue::from_str("2:c1").unwrap()), vec![0]),
            (Arc::new(DataBlockValue::from_str("3:d1").unwrap()), vec![0]),
            (Arc::new(DataBlockValue::from_str("0:a2").unwrap()), vec![1]),
            (
                Arc::new(DataBlockValue::from_str("1:b2").unwrap()),
                vec![1, 2],
            ),
            (Arc::new(DataBlockValue::from_str("3:d2").unwrap()), vec![1]),
            (Arc::new(DataBlockValue::from_str("3:d3").unwrap()), vec![2]),
        ]
        .iter()
        .cloned()
        .collect(),
    );
}

#[test]
fn validate_calc_attr_rows_by_column_with_no_empty_values() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_map_equals(
        &db.calc_attr_rows_by_column_with_no_empty_values(),
        &[
            (
                0,
                [
                    (
                        Arc::new(DataBlockValue::from_str("0:a1").unwrap()),
                        vec![0, 2],
                    ),
                    (Arc::new(DataBlockValue::from_str("0:a2").unwrap()), vec![1]),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            (
                1,
                [
                    (Arc::new(DataBlockValue::from_str("1:b1").unwrap()), vec![0]),
                    (
                        Arc::new(DataBlockValue::from_str("1:b2").unwrap()),
                        vec![1, 2],
                    ),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            (
                2,
                [(Arc::new(DataBlockValue::from_str("2:c1").unwrap()), vec![0])]
                    .iter()
                    .cloned()
                    .collect(),
            ),
            (
                3,
                [
                    (Arc::new(DataBlockValue::from_str("3:d1").unwrap()), vec![0]),
                    (Arc::new(DataBlockValue::from_str("3:d2").unwrap()), vec![1]),
                    (Arc::new(DataBlockValue::from_str("3:d3").unwrap()), vec![2]),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
        ]
        .iter()
        .cloned()
        .collect(),
    );
}

#[test]
fn validate_calc_attr_rows_by_column_with_empty_values() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_map_equals(
        &db.calc_attr_rows_by_column_with_empty_values(&Arc::new("".to_owned())),
        &[
            (
                0,
                [
                    (
                        Arc::new(DataBlockValue::from_str("0:a1").unwrap()),
                        vec![0, 2],
                    ),
                    (Arc::new(DataBlockValue::from_str("0:a2").unwrap()), vec![1]),
                    (Arc::new(DataBlockValue::from_str("0:").unwrap()), vec![]),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            (
                1,
                [
                    (Arc::new(DataBlockValue::from_str("1:b1").unwrap()), vec![0]),
                    (
                        Arc::new(DataBlockValue::from_str("1:b2").unwrap()),
                        vec![1, 2],
                    ),
                    (Arc::new(DataBlockValue::from_str("1:").unwrap()), vec![]),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            (
                2,
                [
                    (Arc::new(DataBlockValue::from_str("2:c1").unwrap()), vec![0]),
                    (
                        Arc::new(DataBlockValue::from_str("2:").unwrap()),
                        vec![1, 2],
                    ),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            (
                3,
                [
                    (Arc::new(DataBlockValue::from_str("3:d1").unwrap()), vec![0]),
                    (Arc::new(DataBlockValue::from_str("3:d2").unwrap()), vec![1]),
                    (Arc::new(DataBlockValue::from_str("3:d3").unwrap()), vec![2]),
                    (Arc::new(DataBlockValue::from_str("3:").unwrap()), vec![]),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
        ]
        .iter()
        .cloned()
        .collect(),
    );
}

#[test]
fn validate_number_of_records() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_eq!(db.number_of_records(), 3);
}

#[test]
fn validate_protected_number_of_records() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_eq!(db.protected_number_of_records(2), 2);
}

#[test]
fn validate_normalize_reporting_length() {
    let db = read_test_data_block(TEST_FILE_PATH, DELIMITER, &[], &[], 0);

    assert_eq!(db.normalize_reporting_length(0), 4);
    assert_eq!(db.normalize_reporting_length(10), 4);
    assert_eq!(db.normalize_reporting_length(2), 2);
}