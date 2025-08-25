use globset::{Error as GlobError, Glob, GlobSet, GlobSetBuilder};

#[derive(Debug)]
pub enum MatchError {
    Glob(GlobError),
    NoMatch(String),
}

pub fn build_globset(patterns: Vec<String>) -> Result<GlobSet, GlobError> {
    patterns
        .iter()
        .map(|p| Glob::new(p))
        .collect::<Result<Vec<_>, _>>()?
        .into_iter()
        .fold(GlobSetBuilder::new(), |mut builder, glob| {
            builder.add(glob);
            builder
        })
        .build()
}

pub fn is_glob_match(matchers: &GlobSet, glob: &str) -> Result<usize, MatchError> {
    matchers
        .matches(glob)
        .first()
        .copied()
        .ok_or_else(|| MatchError::NoMatch(glob.to_string()))
}
