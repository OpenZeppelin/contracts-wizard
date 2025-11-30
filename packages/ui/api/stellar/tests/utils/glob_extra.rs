use stellar_api::utils::{build_globset, is_glob_match, MatchError};

#[test]
fn builds_and_matches_globset() {
    let patterns = vec!["dir/*.txt".to_string(), "a.txt".to_string()];
    let gs = build_globset(patterns).expect("should build globset");

    // matching existing pattern
    let ok = is_glob_match(&gs, "dir/file.txt");
    assert!(ok.is_ok(), "expected a match for dir/file.txt");

    // non matching path should return NoMatch
    let no = is_glob_match(&gs, "other.bin");
    match no {
        Err(MatchError::NoMatch(s)) => assert_eq!(s, "other.bin"),
        _ => panic!("expected NoMatch for other.bin"),
    }
}
