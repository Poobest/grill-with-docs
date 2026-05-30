/**
 * Integration tests run against a REAL PostgreSQL test database (no Prisma
 * mocks — per the project's testing decision). Point the Prisma client at the
 * dedicated test DB before any service constructs its client.
 *
 * Override with TEST_DATABASE_URL in CI; the default matches docker-compose.yml
 * (a throwaway local container, not a production credential).
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:password@localhost:5432/installment_saas_test?schema=public';
