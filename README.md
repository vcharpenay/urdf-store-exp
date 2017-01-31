# µRDF store experiments

Test sets and queries used in the experiments were derived from the [Lehigh University Benchmark (LUBM)](http://swat.cse.lehigh.edu/projects/lubm/).

## Test sets & queries

The repository is organized as follows:

```
/lubm
  /answers
    /tpf
      q{query number}.xml
      q{query number}-optimized.xml
    q{query number}.xml
  /queries
    /tpf
      q{query number}.xml
      q{query number}-optimized.xml
    q{query number}.xml
  {number of triples}.lubm-inf-10000.nt
  lubm-inf-1000.nt
```

### Memory footprint

To evaluate the memory footprint of the µRDF Store, we generated random data sets of increasing size. We first generated a dataset of max. 10,000 triples, included inferred axioms (ABox only), and created files with the name `/lubm/{number of triples}.lubm-inf-10000.nt`, each containing `{number of triples}` triples from the original dataset.

### Query processing time

All other experiments were conducted with the dataset in `/lubm/lubm-inf-1000.nt`, constructed the same way. The queries in `/lubm/queries` are derived from LUBM's query mix. The expected answer for each query against our dataset can be found in `/lubm/answers` with the same file name. Both folders contain a subfolder `/tpf` that include queries and answers theoretically exchanged through an inteface similar to that of [Triple Pattern Fragments (TPF)](http://www.hydra-cg.com/spec/latest/triple-pattern-fragments/).

## Implementation details

### UBA profile

UBA is configured to generate at least 100,000 triples with the [default data profile](http://swat.cse.lehigh.edu/projects/lubm/profile.htm). As the datasets we target in these experiments cannot exceed 10,000 triples, we ran UBA with a custom profile (default values in parentheses, see `Generator.java` from UBA 1.7):

```java
private static final int UNDER_COURSE_NUM = 100; //must >= max faculty # * FACULTY_COURSE_MAX
private static final int GRAD_COURSE_NUM = 100; //must >= max faculty # * FACULTY_GRADCOURSE_MAX
private static final int UNIV_NUM = 1000;
private static final int RESEARCH_NUM = 30;
private static final int DEPT_MIN = 1; // (15)
private static final int DEPT_MAX = 1; // (25)
private static final int FULLPROF_PUB_MIN = 5; // (15)
private static final int FULLPROF_PUB_MAX = 8; // (20)
private static final int ASSOPROF_PUB_MIN = 5; // (10)
private static final int ASSOPROF_PUB_MAX = 6; // (18)
private static final int ASSTPROF_PUB_MIN = 3; // (5)
private static final int ASSTPROF_PUB_MAX = 5; // (10)
private static final int GRADSTUD_PUB_MIN = 0;
private static final int GRADSTUD_PUB_MAX = 3; // (5)
private static final int LEC_PUB_MIN = 0;
private static final int LEC_PUB_MAX = 3; // (5)
private static final int FACULTY_COURSE_MIN = 1;
private static final int FACULTY_COURSE_MAX = 2;
private static final int FACULTY_GRADCOURSE_MIN = 1;
private static final int FACULTY_GRADCOURSE_MAX = 2;
private static final int UNDERSTUD_COURSE_MIN = 2;
private static final int UNDERSTUD_COURSE_MAX = 4;
private static final int GRADSTUD_COURSE_MIN = 1;
private static final int GRADSTUD_COURSE_MAX = 3;
private static final int RESEARCHGROUP_MIN = 2; // (10)
private static final int RESEARCHGROUP_MAX = 3; // (20)
//faculty number: 6-13 (30-42)
private static final int FULLPROF_MIN = 1; // (7)
private static final int FULLPROF_MAX = 2; // (10)
private static final int ASSOPROF_MIN = 1; // (10)
private static final int ASSOPROF_MAX = 3; // (14)
private static final int ASSTPROF_MIN = 1; // (8)
private static final int ASSTPROF_MAX = 2; // (11)
private static final int LEC_MIN = 2; // (5)
private static final int LEC_MAX = 3; // (7)
private static final int R_UNDERSTUD_FACULTY_MIN = 3; // (8)
private static final int R_UNDERSTUD_FACULTY_MAX = 5; // (14)
private static final int R_GRADSTUD_FACULTY_MIN = 1; // (3)
private static final int R_GRADSTUD_FACULTY_MAX = 2; // (4)
//MUST: FACULTY_COURSE_MIN >= R_GRADSTUD_FACULTY_MAX / R_GRADSTUD_TA_MIN;
private static final int R_GRADSTUD_TA_MIN = 4;
private static final int R_GRADSTUD_TA_MAX = 5;
private static final int R_GRADSTUD_RA_MIN = 3;
private static final int R_GRADSTUD_RA_MAX = 4;
private static final int R_UNDERSTUD_ADVISOR = 5;
private static final int R_GRADSTUD_ADVISOR = 1;
```

### TPF interface

The TPF specification requires a data provider to provide statistics about the fragments
it exposes (triple count estimations). These statistics are at the basis of various algorithms
for client-side SPARQL query evaluation, where clients fetch these metadata during the execution.
In constrained environments, where datasets are expected to be small, sending metadata is as
expensive as sending actual data. Therefore, in our implementation, such metadata are not used
directly. The SPARQL query is evaluated naively, the following way:

 1. retrieve fragment for first triple pattern
 2. for each triple found
   1. bind ... TODO

An important consideration in TPF is pagination. But again, it is less relevant in
our current field of study where data fragmentation is to be avoided, which is why we did not
consider that aspect. In our implementation, only whole fragments are retrieved by the client.

However, it is known that triple pattern ordering greatly influences query evaluation. We
therefore consider the case where queries were optimized before being evaluated, based on
statistics on the dataset that were computed offline. Under the assumption that no pagination
is used, optimizing the query beforehand is equivalent to relying on online estimations provided
for each fragment. Both use a greedy algorithm that evaluate triple patterns in descending order
of selectivity. See next section for details on query optimization.

### Query optimization

```java
String fstats = "micro-lubm-stats.sse";
Model m = FileManager.get().loadModel("some_dataset.ttl");
StatsCollector c = Stats.gather(m.getGraph());
Stats.write(fstats, c.results());
```

```java
Query q = QueryFactory.create("some SPARQL query string");
Op op = Algebra.compile(q);
Transform t = new TransformReorder(ReorderLib.weighted(fstats));
Op optimizedOp = Transformer.transform(t, op);
```

TPF: no pagination, both with query optimization (provided by Jena) and without (original LUBM queries). The query optimization simulates the greedy algorithm described in the original paper.

## Results

### Memory footprint

_Note: HDT headers were not included in the results._

| **Number of triples** | **µRDF store** | **Wiselib TupleStore** | HDT (dictionary) | HDT (triples/dictionary) | HDT (indexes) | **HDT** | k2 -triples (triples) | **k2 -triples** |
| ----------------- | ---------- | ------------------ | ---------------- | ------------------------ | ------------- | --- | --------------------- | ----------- |
| 8 | 517 | 736 | 702 | 821 | 231 | 1052 | 2424 | 3126 |
| 19 | 813 | 1301 | 846 | 975 | 283 | 1258 | 4049 | 4895 |
| 34 | 1341 | 1977 | 1120 | 1283 | 306 | 1589 | 4884 | 6004 |
| 70 | 2016 | 3054 | 1376 | 1582 | 363 | 1945 | 5322 | 6698 |
| 131 | 3312 | 4633 | 1881 | 2212 | 458 | 2670 | 5871 | 7752 |
| 259 | 5609 | 7179 | 2499 | 3068 | 702 | 3770 | 6981 | 9480 |
| 518 | 9739 | 11951 | 3700 | 4755 | 1155 | 5910 | 8608 | 12308 |
| 1035 | 16995 | 19480 | 5439 | 7595 | 2134 | 9729 | 11347 | 16786 |
| 2054 | 29537 | 30747 | 7836 | 12255 | 4134 | 16389 | 12847 | 20683 |
| 4102 | 53284 | 48754 | 11456 | 20685 | 8401 | 29086 | 15803 | 27259 |
| 8198 | 99141 | 78339 | 17515 | 36880 | 17456 | 54336 | 20886 | 38401 |

### Query processing time

|     | EXI processing time | Total time | Number of triples | Result size (RDF/EXI) |
| --- | ------------------- | ---------- | ----------------- | --------------------- |
| Q1  | 40                  | 140        | 2                 | 203                   |
| Q3  | 31                  | 159        | 8                 | 495                   |
| Q6  | 16                  | 129        | 26                | 1826                  |
| Q8  | 71                  | 646        | 53                | 2202                  |
| Q9  | 82                  | 924        | 15                | 608                   |

Execution times expressed in clock ticks (C type `clock_t`). On the ESP9266, this roughly corresponds to times in millisecond.
