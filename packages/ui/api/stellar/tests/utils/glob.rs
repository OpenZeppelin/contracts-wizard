use stellar_api::utils::{build_globset, is_glob_match};

#[test]
fn test_single_pattern_match() {
    let globset = build_globset(vec!["*.rs".to_string()]).unwrap();
    let matcher = globset.matches("main.rs");
    assert!(!matcher.is_empty());
}

#[test]
fn test_single_pattern_no_match() {
    let globset = build_globset(vec!["*.rs".to_string()]).unwrap();
    let matcher = globset.matches("main.txt");
    assert!(matcher.is_empty());
}

#[test]
fn test_multiple_patterns_match() {
    let globset = build_globset(vec!["*.rs".to_string(), "*.txt".to_string()]).unwrap();
    assert!(globset.is_match("lib.rs"));
    assert!(globset.is_match("readme.txt"));
    assert!(!globset.is_match("image.png"));
}

#[test]
fn test_empty_patterns() {
    let globset = build_globset(Vec::<String>::new()).unwrap();
    assert!(!globset.is_match("main.rs"));
}

#[test]
fn test_invalid_pattern() {
    let result = build_globset(vec!["[invalid".to_string()]);
    assert!(result.is_err());
}

#[test]
fn test_directory_pattern() {
    let globset = build_globset(vec!["src/*".to_string()]).unwrap();
    assert!(globset.is_match("src/main.rs"));
    assert!(!globset.is_match("tests/main.rs"));
}

#[test]
fn test_question_mark_pattern() {
    let globset = build_globset(vec!["file?.rs".to_string()]).unwrap();
    assert!(globset.is_match("file1.rs"));
    assert!(globset.is_match("fileA.rs"));
    assert!(!globset.is_match("file10.rs"));
}

#[test]
fn test_is_glob_match_success() {
    let globset = build_globset(vec!["*.rs".to_string(), "*.txt".to_string()]).unwrap();
    let result = is_glob_match(&globset, "main.rs");
    assert!(matches!(result, Ok(0)));
}

#[test]
fn test_is_glob_match_no_match() {
    let globset = build_globset(vec!["*.rs".to_string(), "*.txt".to_string()]).unwrap();
    let result = is_glob_match(&globset, "image.png");
    assert!(result.is_err());
}

#[test]
fn test_is_glob_match_invalid_pattern() {
    let globset = build_globset(vec!["[invalid".to_string()]);
    assert!(globset.is_err());
}
