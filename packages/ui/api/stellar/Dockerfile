### Builder stage
FROM rust:1.88-slim AS builder
WORKDIR /usr/src/stellar

# Copy source code and compile
COPY . .
RUN cargo build --release

### Runtime stage
FROM debian:buster-slim
WORKDIR /usr/local/bin

# Copy the compiled binary
COPY --from=builder /usr/src/stellar/target/release/stellar .

EXPOSE 5000
CMD ["./stellar"]