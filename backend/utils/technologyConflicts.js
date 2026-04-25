/**
 * Technology Conflict Map — Fix #4
 *
 * Maps each technology to others it directly conflicts with,
 * meaning: a question tagged with a conflicting technology is
 * WRONG or IRRELEVANT for a job that requires the keyed technology.
 *
 * Rules applied when building this map:
 *   1. Only add a conflict when the technologies are ALTERNATIVES for
 *      the same role/purpose (e.g. React vs Angular for frontend UI).
 *   2. Do NOT add a conflict when technologies are COMPLEMENTARY and
 *      commonly used together (e.g. Docker + Kubernetes, React + Redux,
 *      Redis + PostgreSQL).
 *   3. JavaScript and TypeScript have NO conflicts — they are universal
 *      and coexist with every backend, framework, and toolchain.
 *   4. Generic concepts (REST, HTTP, OOP, Data Structures, Algorithms,
 *      System Design) have no conflicts — they apply everywhere.
 *
 * getExcludedTechnologies() uses this map to build a Set of technology
 * names that must NOT appear in bank question tags for a given job.
 * A technology is only excluded if it is NOT also a job keyword
 * (handles cross-stack jobs like "Python + Go" correctly).
 */

const CONFLICTS = {

  // ─── Backend Frameworks ────────────────────────────────────────────────────
  // These are direct alternatives: you pick one framework per project.

  "Node.js":       ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Sinatra", "Spring Boot", "Spring MVC", "ASP.NET", "ASP.NET Core", "Phoenix", "Gin", "Fiber", "Echo", "Actix", "Rocket", "Ktor", "Quarkus", "Micronaut", "Hapi.js"],
  "Express":       ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Spring Boot", "ASP.NET", "Phoenix", "Gin", "Fiber"],
  "NestJS":        ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Spring Boot", "ASP.NET", "Phoenix", "Gin"],
  "Fastify":       ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Spring Boot", "ASP.NET"],
  "Koa":           ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Spring Boot", "ASP.NET"],
  "Hapi.js":       ["Django", "Flask", "FastAPI", "Laravel", "Rails", "Spring Boot", "ASP.NET"],

  "Django":        ["Node.js", "Express", "NestJS", "Fastify", "Koa", "Laravel", "Rails", "Sinatra", "Spring Boot", "Spring MVC", "ASP.NET", "ASP.NET Core", "Phoenix", "Gin", "Fiber", "Echo", "Actix", "Rocket"],
  "Flask":         ["Node.js", "Express", "NestJS", "Fastify", "Koa", "Django", "Laravel", "Rails", "Spring Boot", "ASP.NET", "ASP.NET Core", "Phoenix", "Gin"],
  "FastAPI":       ["Node.js", "Express", "NestJS", "Fastify", "Koa", "Django", "Laravel", "Rails", "Spring Boot", "ASP.NET", "ASP.NET Core", "Phoenix", "Gin"],

  "Spring Boot":   ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Laravel", "Rails", "ASP.NET", "ASP.NET Core", "Phoenix", "Gin", "Fiber", "Actix"],
  "Spring MVC":    ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Laravel", "Rails", "ASP.NET", "ASP.NET Core"],

  "Laravel":       ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "ASP.NET Core", "Rails", "Phoenix"],
  "Rails":         ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "ASP.NET Core", "Laravel", "Phoenix"],
  "Sinatra":       ["Node.js", "Express", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel"],

  "ASP.NET":       ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "Spring MVC", "Laravel", "Rails", "Phoenix", "Gin"],
  "ASP.NET Core":  ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Rails", "Phoenix"],

  "Phoenix":       ["Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", "Rails", "Gin", "Fiber"],
  "Gin":           ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", "Rails", "Phoenix"],
  "Fiber":         ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET"],
  "Echo":          ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET"],
  "Actix":         ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET"],
  "Rocket":        ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET"],
  "Ktor":          ["Node.js", "Express", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Rails"],
  "Quarkus":       ["Node.js", "Express", "Django", "Flask", "ASP.NET", "Laravel", "Rails"],
  "Micronaut":     ["Node.js", "Express", "Django", "Flask", "ASP.NET", "Laravel", "Rails"],

  // ─── Frontend Frameworks ───────────────────────────────────────────────────
  // These are UI framework alternatives: you build your SPA in one, not all.

  "React":         ["Angular", "Vue", "Svelte", "Ember", "Solid.js", "Qwik", "Backbone.js", "Alpine.js"],
  "Angular":       ["React", "Vue", "Svelte", "Ember", "Solid.js", "Backbone.js"],
  "Vue":           ["React", "Angular", "Svelte", "Ember", "Solid.js", "Backbone.js"],
  "Svelte":        ["React", "Angular", "Vue", "Ember", "Solid.js"],
  "Ember":         ["React", "Angular", "Vue", "Svelte", "Solid.js"],
  "Solid.js":      ["React", "Angular", "Vue", "Svelte", "Ember"],
  "Backbone.js":   ["React", "Angular", "Vue", "Svelte"],
  "Alpine.js":     ["React", "Angular", "Vue", "Svelte"],
  "Qwik":          ["React", "Angular", "Vue", "Svelte"],

  // ─── Full-stack / Meta-frameworks ──────────────────────────────────────────
  // Each meta-framework is tied to one UI library, so they conflict with peers.

  "Next.js":           ["Nuxt", "SvelteKit", "Analog", "Remix", "Gatsby", "Angular Universal"],
  "Nuxt":              ["Next.js", "SvelteKit", "Analog", "Remix", "Gatsby"],
  "SvelteKit":         ["Next.js", "Nuxt", "Analog", "Remix", "Gatsby"],
  "Remix":             ["Next.js", "Nuxt", "SvelteKit", "Gatsby"],
  "Gatsby":            ["Next.js", "Nuxt", "SvelteKit", "Remix"],
  "Angular Universal": ["Next.js", "Nuxt", "SvelteKit", "Remix"],
  "Analog":            ["Next.js", "Nuxt", "SvelteKit", "Remix"],

  // ─── State Management ──────────────────────────────────────────────────────
  // Client-side state tools are chosen per project (not layered).

  "Redux":    ["MobX", "Zustand", "Recoil", "Jotai", "Valtio", "NgRx", "Pinia", "Vuex", "XState"],
  "MobX":     ["Redux", "Zustand", "Recoil", "Jotai", "NgRx", "Pinia", "Vuex"],
  "Zustand":  ["Redux", "MobX", "Recoil", "Jotai", "NgRx"],
  "Recoil":   ["Redux", "MobX", "Zustand", "Jotai", "NgRx"],
  "Jotai":    ["Redux", "MobX", "Zustand", "Recoil", "NgRx"],
  "Valtio":   ["Redux", "MobX", "Zustand"],
  "NgRx":     ["Redux", "MobX", "Zustand", "Recoil", "Pinia", "Vuex"],
  "Pinia":    ["Redux", "MobX", "NgRx", "Vuex", "Recoil"],
  "Vuex":     ["Redux", "MobX", "NgRx", "Pinia"],
  "XState":   ["Redux", "MobX", "Zustand"],

  // ─── Programming Languages ────────────────────────────────────────────────
  // JS and TS are intentionally excluded — they coexist with every stack.
  // Languages listed here are alternatives for backend / systems / data roles.

  "Python":      ["Java", "C#", "Go", "Ruby", "PHP", "Rust", "Scala", "Kotlin", "Elixir", "Haskell", "Erlang", "Clojure", "F#", "Perl"],
  "Java":        ["Python", "C#", "Go", "Ruby", "PHP", "Rust", "Scala", "Elixir", "Kotlin"],
  "C#":          ["Python", "Java", "Go", "Ruby", "PHP", "Rust", "Scala", "F#"],
  "Go":          ["Python", "Java", "C#", "Ruby", "PHP", "Rust", "Scala", "Elixir"],
  "Ruby":        ["Python", "Java", "C#", "Go", "PHP", "Rust", "Scala"],
  "PHP":         ["Python", "Java", "C#", "Go", "Ruby", "Rust"],
  "Rust":        ["Python", "Java", "C#", "Go", "Ruby", "PHP"],
  "Scala":       ["Python", "C#", "Go", "Ruby", "PHP", "Java"],
  "Elixir":      ["Python", "Java", "C#", "Go", "Ruby", "PHP"],
  "Haskell":     ["Python", "Java", "C#", "Go", "Ruby", "PHP"],
  "Erlang":      ["Python", "Java", "C#", "Go"],
  "Clojure":     ["Python", "Java", "C#", "Go", "Ruby", "PHP"],
  "F#":          ["Python", "C#", "Go", "Ruby", "PHP"],
  "Perl":        ["Python", "Ruby", "PHP"],
  "R":           ["Python", "Julia", "MATLAB"],
  "Julia":       ["Python", "R", "MATLAB"],
  "MATLAB":      ["Python", "R", "Julia"],
  "Dart":        ["Swift", "Kotlin"],
  "C":           ["C++"],
  "C++":         ["C", "Rust"],
  "Objective-C": ["Swift"],

  // ─── Mobile Development ────────────────────────────────────────────────────
  // iOS vs Android vs Cross-platform are distinct skill sets.

  "Swift":        ["Kotlin", "Java", "Flutter", "React Native", "Xamarin", "Ionic", "Capacitor"],
  "Objective-C":  ["Kotlin", "Java", "Flutter", "React Native", "Swift"],
  "Kotlin":       ["Swift", "Objective-C", "Flutter", "React Native", "Xamarin", "Ionic"],
  "Flutter":      ["Swift", "Objective-C", "Kotlin", "React Native", "Xamarin", "Ionic", "Capacitor"],
  "React Native": ["Swift", "Objective-C", "Kotlin", "Flutter", "Xamarin", "Ionic"],
  "Xamarin":      ["Swift", "Kotlin", "Flutter", "React Native", "Ionic"],
  "Ionic":        ["Swift", "Kotlin", "Flutter", "React Native", "Xamarin"],
  "Capacitor":    ["Swift", "Kotlin", "Flutter", "React Native"],

  // ─── Databases — Relational vs Non-Relational ─────────────────────────────
  // SQL databases (PostgreSQL, MySQL, etc.) don't strongly conflict with each
  // other because SQL questions transfer. They DO conflict with document/graph
  // databases. NoSQL databases conflict with relational ones.

  "MongoDB":       ["PostgreSQL", "MySQL", "MariaDB", "Oracle", "SQL Server", "SQLite", "CockroachDB", "PlanetScale"],
  "Cassandra":     ["PostgreSQL", "MySQL", "MariaDB", "Oracle", "SQL Server", "MongoDB", "DynamoDB"],
  "DynamoDB":      ["PostgreSQL", "MySQL", "MariaDB", "Oracle", "SQL Server", "MongoDB", "Cassandra", "CouchDB"],
  "Couchbase":     ["PostgreSQL", "MySQL", "Oracle", "SQL Server", "MongoDB"],
  "CouchDB":       ["PostgreSQL", "MySQL", "Oracle", "SQL Server", "DynamoDB"],
  "RavenDB":       ["PostgreSQL", "MySQL", "Oracle", "SQL Server"],
  "Neo4j":         ["PostgreSQL", "MySQL", "Oracle", "MongoDB", "Cassandra"],
  "Amazon Neptune":["PostgreSQL", "MySQL", "Oracle", "MongoDB"],
  "InfluxDB":      ["PostgreSQL", "MySQL", "MongoDB", "Cassandra"],
  "TimescaleDB":   ["MongoDB", "Cassandra", "DynamoDB"],
  "ClickHouse":    ["PostgreSQL", "MySQL", "MongoDB"],
  "Snowflake":     ["PostgreSQL", "MySQL", "MongoDB", "BigQuery", "Redshift"],
  "BigQuery":      ["Snowflake", "Redshift", "PostgreSQL", "MySQL"],
  "Redshift":      ["Snowflake", "BigQuery", "PostgreSQL", "MySQL"],
  "FaunaDB":       ["PostgreSQL", "MySQL", "MongoDB"],
  "PlanetScale":   ["MongoDB", "Cassandra", "DynamoDB"],

  "PostgreSQL":    ["MongoDB", "Cassandra", "DynamoDB", "Couchbase", "CouchDB", "Neo4j", "InfluxDB"],
  "MySQL":         ["MongoDB", "Cassandra", "DynamoDB", "Couchbase", "CouchDB", "Neo4j"],
  "MariaDB":       ["MongoDB", "Cassandra", "DynamoDB"],
  "Oracle":        ["MongoDB", "Cassandra", "DynamoDB", "Neo4j"],
  "SQL Server":    ["MongoDB", "Cassandra", "DynamoDB", "Neo4j"],
  "SQLite":        ["MongoDB", "Cassandra", "DynamoDB"],
  "CockroachDB":   ["MongoDB", "Cassandra", "DynamoDB"],

  // ─── Cloud Providers ──────────────────────────────────────────────────────
  // Cloud-specific services (Lambda vs Cloud Functions) are not transferable.

  "AWS":            ["Azure", "GCP", "Alibaba Cloud", "IBM Cloud", "Oracle Cloud"],
  "Azure":          ["AWS", "GCP", "Alibaba Cloud", "IBM Cloud"],
  "GCP":            ["AWS", "Azure", "Alibaba Cloud", "IBM Cloud"],
  "Alibaba Cloud":  ["AWS", "Azure", "GCP"],
  "IBM Cloud":      ["AWS", "Azure", "GCP"],
  "Oracle Cloud":   ["AWS", "Azure", "GCP"],
  "Cloudflare Workers": ["AWS", "Azure", "GCP"],

  // ─── CI/CD Tools ──────────────────────────────────────────────────────────
  // Teams use one primary CI system — pipeline syntax is not portable.

  "Jenkins":            ["GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Bamboo", "TeamCity", "Azure DevOps", "Bitbucket Pipelines", "Drone CI", "Concourse"],
  "GitHub Actions":     ["Jenkins", "GitLab CI", "CircleCI", "Travis CI", "Bamboo", "TeamCity", "Bitbucket Pipelines", "Drone CI"],
  "GitLab CI":          ["Jenkins", "GitHub Actions", "CircleCI", "Travis CI", "Bamboo", "TeamCity", "Bitbucket Pipelines"],
  "CircleCI":           ["Jenkins", "GitHub Actions", "GitLab CI", "Travis CI", "Bamboo", "TeamCity"],
  "Travis CI":          ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Bamboo"],
  "Bamboo":             ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "TeamCity"],
  "TeamCity":           ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI"],
  "Azure DevOps":       ["Jenkins", "GitHub Actions", "GitLab CI"],
  "Bitbucket Pipelines":["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI"],
  "Drone CI":           ["Jenkins", "GitHub Actions", "GitLab CI"],
  "Concourse":          ["Jenkins", "GitHub Actions"],

  // ─── Infrastructure as Code ───────────────────────────────────────────────
  // IaC tools (Terraform, Pulumi) conflict; config managers (Ansible, Puppet) conflict.
  // Terraform and Ansible do NOT conflict — they serve different purposes.

  "Terraform":      ["Pulumi", "CloudFormation", "CDK"],
  "Pulumi":         ["Terraform", "CloudFormation", "CDK"],
  "CloudFormation": ["Terraform", "Pulumi", "CDK"],
  "CDK":            ["Terraform", "Pulumi", "CloudFormation"],
  "Ansible":        ["Puppet", "Chef", "SaltStack"],
  "Puppet":         ["Ansible", "Chef", "SaltStack"],
  "Chef":           ["Ansible", "Puppet", "SaltStack"],
  "SaltStack":      ["Ansible", "Puppet", "Chef"],

  // ─── Container Orchestration ──────────────────────────────────────────────
  // Docker and Kubernetes coexist. Kubernetes alternatives conflict.

  "Docker Swarm": ["Kubernetes", "Nomad", "Mesos"],
  "Nomad":        ["Kubernetes", "Docker Swarm", "Mesos"],
  "Mesos":        ["Kubernetes", "Docker Swarm", "Nomad"],
  "OpenShift":    ["Kubernetes", "Rancher"],
  "Rancher":      ["OpenShift"],

  // ─── Testing Frameworks — Unit ────────────────────────────────────────────
  // Test frameworks are language-specific. A pytest question is irrelevant
  // to a JavaScript job that uses Jest.

  "Jest":     ["pytest", "JUnit", "NUnit", "xUnit", "RSpec", "Mocha", "Jasmine", "PHPUnit", "Vitest"],
  "Vitest":   ["pytest", "JUnit", "NUnit", "xUnit", "RSpec", "Mocha", "Jasmine", "PHPUnit", "Jest"],
  "Mocha":    ["pytest", "JUnit", "NUnit", "xUnit", "RSpec", "Jest", "Vitest", "Jasmine"],
  "Jasmine":  ["pytest", "JUnit", "NUnit", "xUnit", "RSpec", "Jest", "Vitest", "Mocha"],
  "pytest":   ["Jest", "Vitest", "Mocha", "JUnit", "NUnit", "xUnit", "RSpec", "PHPUnit"],
  "JUnit":    ["Jest", "Vitest", "Mocha", "pytest", "NUnit", "xUnit", "RSpec", "PHPUnit"],
  "NUnit":    ["Jest", "Vitest", "Mocha", "pytest", "JUnit", "xUnit", "RSpec"],
  "xUnit":    ["Jest", "Vitest", "Mocha", "pytest", "JUnit", "NUnit", "RSpec"],
  "RSpec":    ["Jest", "Vitest", "Mocha", "pytest", "JUnit", "NUnit", "xUnit"],
  "PHPUnit":  ["Jest", "Vitest", "Mocha", "pytest", "JUnit", "NUnit"],

  // ─── Testing Frameworks — E2E ─────────────────────────────────────────────
  // E2E tools serve the same role; teams pick one.

  "Cypress":     ["Playwright", "Selenium", "Puppeteer", "WebdriverIO", "TestCafe"],
  "Playwright":  ["Cypress", "Selenium", "Puppeteer", "WebdriverIO", "TestCafe"],
  "Selenium":    ["Cypress", "Playwright", "Puppeteer", "TestCafe"],
  "Puppeteer":   ["Cypress", "Playwright", "Selenium", "TestCafe"],
  "WebdriverIO": ["Cypress", "Playwright", "Selenium"],
  "TestCafe":    ["Cypress", "Playwright", "Selenium"],

  // ─── ORMs / Data Access Layers ────────────────────────────────────────────
  // ORMs are tied to a language/framework. A Hibernate (Java) question is
  // useless for a Node.js job using Prisma.

  "Prisma":           ["SQLAlchemy", "Hibernate", "Entity Framework", "ActiveRecord", "Eloquent", "GORM", "Sequelize", "TypeORM"],
  "Sequelize":        ["SQLAlchemy", "Hibernate", "Entity Framework", "ActiveRecord", "Eloquent", "GORM", "Prisma", "TypeORM"],
  "TypeORM":          ["SQLAlchemy", "Hibernate", "Entity Framework", "ActiveRecord", "Eloquent", "GORM", "Prisma"],
  "Mongoose":         ["SQLAlchemy", "Hibernate", "Entity Framework", "ActiveRecord", "Eloquent"],
  "SQLAlchemy":       ["Prisma", "Sequelize", "TypeORM", "Hibernate", "Entity Framework", "ActiveRecord", "Eloquent", "GORM"],
  "Hibernate":        ["Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Entity Framework", "ActiveRecord", "Eloquent"],
  "Entity Framework": ["Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Hibernate", "ActiveRecord", "Eloquent"],
  "ActiveRecord":     ["Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Hibernate", "Entity Framework", "Eloquent"],
  "Eloquent":         ["Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Hibernate", "Entity Framework", "ActiveRecord"],
  "GORM":             ["Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Hibernate", "Entity Framework"],

  // ─── ML / AI Frameworks ────────────────────────────────────────────────────
  // TensorFlow and PyTorch are direct competitors for deep learning.

  "TensorFlow": ["PyTorch", "JAX", "MXNet", "Caffe", "Theano"],
  "PyTorch":    ["TensorFlow", "JAX", "MXNet", "Caffe"],
  "JAX":        ["TensorFlow", "PyTorch", "MXNet"],
  "MXNet":      ["TensorFlow", "PyTorch", "JAX"],
  "Caffe":      ["TensorFlow", "PyTorch", "JAX"],
  "Theano":     ["TensorFlow", "PyTorch"],

  // ─── Message Brokers / Event Streaming ────────────────────────────────────
  // Kafka and RabbitMQ are chosen per architecture; SQS is AWS-specific.

  "Apache Kafka":    ["RabbitMQ", "Amazon SQS", "Apache ActiveMQ", "Azure Service Bus", "Google Pub/Sub", "NATS", "Pulsar"],
  "RabbitMQ":        ["Apache Kafka", "Amazon SQS", "Apache ActiveMQ", "Azure Service Bus", "NATS", "Pulsar"],
  "Amazon SQS":      ["Apache Kafka", "RabbitMQ", "Apache ActiveMQ", "Azure Service Bus"],
  "Apache ActiveMQ": ["Apache Kafka", "RabbitMQ", "Amazon SQS", "NATS"],
  "Azure Service Bus":["Apache Kafka", "RabbitMQ", "Amazon SQS"],
  "Google Pub/Sub":  ["Apache Kafka", "RabbitMQ", "Amazon SQS"],
  "NATS":            ["Apache Kafka", "RabbitMQ", "Apache ActiveMQ"],
  "Pulsar":          ["Apache Kafka", "RabbitMQ"],

  // ─── Caching ─────────────────────────────────────────────────────────────
  // Redis and Memcached are both in-memory caches — teams choose one.

  "Redis":      ["Memcached", "Hazelcast", "Ehcache"],
  "Memcached":  ["Redis", "Hazelcast", "Ehcache"],
  "Hazelcast":  ["Redis", "Memcached", "Ehcache"],
  "Ehcache":    ["Redis", "Memcached", "Hazelcast"],

  // ─── Search Engines ───────────────────────────────────────────────────────
  "Elasticsearch": ["Solr", "Algolia", "MeiliSearch", "OpenSearch", "Typesense"],
  "OpenSearch":    ["Elasticsearch", "Solr", "Algolia", "Typesense"],
  "Solr":          ["Elasticsearch", "OpenSearch", "Algolia"],
  "Algolia":       ["Elasticsearch", "OpenSearch", "Solr", "MeiliSearch", "Typesense"],
  "MeiliSearch":   ["Elasticsearch", "Algolia", "Typesense"],
  "Typesense":     ["Elasticsearch", "Algolia", "MeiliSearch"],

  // ─── Build Tools — JavaScript ─────────────────────────────────────────────
  "Webpack":  ["Vite", "Parcel", "Rollup", "esbuild", "Turbopack"],
  "Vite":     ["Webpack", "Parcel", "Rollup", "Turbopack"],
  "Parcel":   ["Webpack", "Vite", "Rollup"],
  "Rollup":   ["Webpack", "Vite", "Parcel"],
  "esbuild":  ["Webpack", "Parcel"],
  "Turbopack":["Webpack", "Vite"],
  "Gulp":     ["Grunt"],
  "Grunt":    ["Gulp"],

  // ─── Build Tools — JVM ────────────────────────────────────────────────────
  "Maven":  ["Gradle", "Ant"],
  "Gradle": ["Maven", "Ant"],
  "Ant":    ["Maven", "Gradle"],

  // ─── Package Managers ─────────────────────────────────────────────────────
  "npm":  ["Yarn", "pnpm"],
  "Yarn": ["npm", "pnpm"],
  "pnpm": ["npm", "Yarn"],
  "pip":  ["Poetry", "Conda", "Pipenv"],
  "Poetry":  ["pip", "Conda", "Pipenv"],
  "Conda":   ["pip", "Poetry", "Pipenv"],
  "Pipenv":  ["pip", "Poetry", "Conda"],
  "Cargo":   [],
  "Composer":["pip", "npm", "Bundler"],
  "Bundler": ["pip", "npm", "Composer"],

  // ─── Authentication / Identity ────────────────────────────────────────────
  "Auth0":        ["Keycloak", "Okta", "Firebase Auth", "Cognito", "Passport.js"],
  "Keycloak":     ["Auth0", "Okta", "Firebase Auth", "Cognito"],
  "Okta":         ["Auth0", "Keycloak", "Firebase Auth", "Cognito"],
  "Firebase Auth":["Auth0", "Keycloak", "Okta", "Cognito", "Passport.js"],
  "Cognito":      ["Auth0", "Keycloak", "Okta", "Firebase Auth"],
  "Passport.js":  ["Auth0", "Firebase Auth"],

  // ─── Monitoring & Observability ───────────────────────────────────────────
  // Metrics/APM platforms are alternatives; Grafana pairs with Prometheus so no conflict.

  "Datadog":   ["New Relic", "Dynatrace", "AppDynamics", "Prometheus"],
  "New Relic": ["Datadog", "Dynatrace", "AppDynamics"],
  "Dynatrace": ["Datadog", "New Relic", "AppDynamics"],
  "AppDynamics":["Datadog", "New Relic", "Dynatrace"],
  "Prometheus":["Datadog"],

  // ─── Workflow Orchestration / Data Pipeline ────────────────────────────────
  "Airflow":  ["Prefect", "Dagster", "Luigi", "Temporal", "Argo Workflows"],
  "Prefect":  ["Airflow", "Dagster", "Luigi", "Temporal"],
  "Dagster":  ["Airflow", "Prefect", "Luigi"],
  "Luigi":    ["Airflow", "Prefect", "Dagster"],
  "Temporal": ["Airflow", "Prefect"],
  "Argo Workflows": ["Airflow", "Prefect"],

  // ─── Data Warehouses / Analytics ─────────────────────────────────────────
  "Snowflake":    ["BigQuery", "Redshift", "Databricks", "Synapse"],
  "BigQuery":     ["Snowflake", "Redshift", "Databricks"],
  "Redshift":     ["Snowflake", "BigQuery", "Databricks"],
  "Databricks":   ["Snowflake", "BigQuery", "Redshift"],
  "Synapse":      ["Snowflake", "BigQuery", "Redshift"],

  // ─── Logging ─────────────────────────────────────────────────────────────
  "ELK Stack":    ["Splunk", "Graylog", "Loki"],
  "Splunk":       ["ELK Stack", "Graylog", "Loki"],
  "Graylog":      ["ELK Stack", "Splunk", "Loki"],
  "Loki":         ["ELK Stack", "Splunk", "Graylog"],

  // ─── API Gateways ────────────────────────────────────────────────────────
  "Kong":         ["NGINX Plus", "AWS API Gateway", "Apigee", "Traefik"],
  "AWS API Gateway":["Kong", "NGINX Plus", "Apigee"],
  "Apigee":       ["Kong", "AWS API Gateway", "NGINX Plus"],
  "Traefik":      ["Kong", "NGINX"],
  "NGINX":        ["Apache HTTP Server", "Traefik"],
  "Apache HTTP Server":["NGINX"],

  // ─── Service Mesh ────────────────────────────────────────────────────────
  "Istio":   ["Linkerd", "Consul Connect", "Kuma"],
  "Linkerd": ["Istio", "Consul Connect", "Kuma"],
  "Consul":  ["Istio", "Linkerd"],
  "Kuma":    ["Istio", "Linkerd"],

  // ─── Game Engines ────────────────────────────────────────────────────────
  "Unity":          ["Unreal Engine", "Godot", "GameMaker"],
  "Unreal Engine":  ["Unity", "Godot"],
  "Godot":          ["Unity", "Unreal Engine"],
  "GameMaker":      ["Unity"],

  // ─── CSS / UI Frameworks ──────────────────────────────────────────────────
  // CSS utility frameworks conflict (you pick one approach).
  "Tailwind CSS":  ["Bootstrap", "Bulma", "Foundation"],
  "Bootstrap":     ["Tailwind CSS", "Bulma", "Foundation"],
  "Bulma":         ["Tailwind CSS", "Bootstrap", "Foundation"],
  "Foundation":    ["Tailwind CSS", "Bootstrap", "Bulma"],

  // Component libraries are more specific to React/Vue/Angular.
  "Material UI":   ["Ant Design", "Chakra UI", "Mantine", "Shadcn UI"],
  "Ant Design":    ["Material UI", "Chakra UI", "Mantine"],
  "Chakra UI":     ["Material UI", "Ant Design", "Mantine"],
  "Mantine":       ["Material UI", "Ant Design", "Chakra UI"],
  "Shadcn UI":     ["Material UI", "Ant Design"],

  // ─── Version Control ─────────────────────────────────────────────────────
  "SVN":       ["Git", "Mercurial"],
  "Mercurial": ["Git", "SVN"],

  // ─── Embedded / RTOS ────────────────────────────────────────────────────
  "FreeRTOS":  ["Zephyr", "RIOT OS", "Mbed OS", "VxWorks"],
  "Zephyr":    ["FreeRTOS", "RIOT OS", "Mbed OS"],
  "RIOT OS":   ["FreeRTOS", "Zephyr", "Mbed OS"],
  "Mbed OS":   ["FreeRTOS", "Zephyr", "RIOT OS"],
  "VxWorks":   ["FreeRTOS", "Zephyr"],
};

/**
 * Given a job's keyword list, returns a Set of lowercase technology names
 * that should be EXCLUDED from question bank results.
 *
 * Only excludes a conflicting tech if it is NOT also a job keyword,
 * so a cross-stack job (e.g. "Python + Go microservices") is handled correctly.
 *
 * Example:
 *   jobKeywords = ["Node.js", "PostgreSQL"]
 *   → Node.js conflicts: [Django, Flask, Spring Boot, ...] → all excluded
 *   → PostgreSQL conflicts: [MongoDB, Cassandra, ...] → excluded
 *   → "React" has no conflicts with either → not excluded
 */
function getExcludedTechnologies(jobKeywords = []) {
  const jobSet   = new Set(jobKeywords.map(k => k.toLowerCase()));
  const excluded = new Set();

  for (const keyword of jobKeywords) {
    const canonicalKey = Object.keys(CONFLICTS).find(
      k => k.toLowerCase() === keyword.toLowerCase()
    );
    if (!canonicalKey) continue;

    for (const conflict of CONFLICTS[canonicalKey]) {
      if (!jobSet.has(conflict.toLowerCase())) {
        excluded.add(conflict.toLowerCase());
      }
    }
  }

  return excluded;
}

/**
 * Filters a list of bank questions, removing any whose tags contain
 * a technology that conflicts with this job's stack.
 *
 * Zero LLM calls — runs entirely in memory in microseconds.
 *
 * @param {Array}  questions   - Array of questionBank records ({ id, question, tags, ... })
 * @param {Array}  jobKeywords - Array of keyword strings from the job
 * @returns {Array} Filtered questions with conflicting-tech questions removed
 */
function filterByTechnologyFit(questions, jobKeywords = []) {
  const excluded = getExcludedTechnologies(jobKeywords);
  if (excluded.size === 0) return questions;

  return questions.filter(q => {
    const qTagsLower  = q.tags.map(t => t.toLowerCase());
    const hasConflict = qTagsLower.some(tag => excluded.has(tag));
    if (hasConflict && process.env.DEBUG_FILTERS === "true") {
      console.log(`[conflict-filter] rejected: "${q.question.slice(0, 60)}${q.question.length > 60 ? "..." : ""}"`);
    }
    return !hasConflict;
  });
}

module.exports = { getExcludedTechnologies, filterByTechnologyFit };
