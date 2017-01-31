# µRDF store experiments

Experiments on the µRDF store include (1) memory footprint evaluation, (2) query processing
time for various SPARQL queries and (3) volume of data exchanged. In the first experiment, the
µRDF store is compared to existing implementations of 
[Wiselib Tuplestore](https://github.com/ibr-alg/wiselib/tree/master/apps/generic_apps/tuplestore_example)
and [HDT](https://github.com/rdfhdt/hdt-cpp) (both with bitmap encoding and k2-tree encoding).
No comparison could be made for the second experiment, as the µRDF store is, to the best of our
knowledge, the first RDF store with a SPARQL interface (µSPARQL) running on micro-controllers.
In the third experiment, it is compared to a simulated
[Triple Pattern Fragments (TPF)](http://www.hydra-cg.com/spec/latest/triple-pattern-fragments/)
interface. Test sets and queries used in the experiments were derived from the
[Lehigh University Benchmark (LUBM)](http://swat.cse.lehigh.edu/projects/lubm/). All files can
be found in this repository.

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

To evaluate the memory footprint of the µRDF Store, we generated random data sets of
increasing size. We first generated a dataset of max. 10,000 triples, included inferred
axioms (ABox only), and created files with the name
`/lubm/{number of triples}.lubm-inf-10000.nt`, each containing `{number of triples}`
triples from the original dataset.

### Query processing time & exchange volume

All other experiments were conducted with the dataset in `/lubm/lubm-inf-1000.nt`,
constructed the same way. The queries in `/lubm/queries` are derived from LUBM's query mix.
The expected answer for each query against our dataset can be found in `/lubm/answers` with
the same file name. Both folders contain a subfolder `/tpf` that include queries and
answers theoretically exchanged through an inteface similar to that of TPF.

## Implementation details

### UBA profile

UBA, the data generator distributed with LUBM, is configured to generate at least
100,000 triples with the
[default data profile](http://swat.cse.lehigh.edu/projects/lubm/profile.htm). As the
datasets we target in these experiments cannot exceed 10,000 triples, we ran UBA with a
custom profile (default values in parentheses, see `Generator.java` from UBA 1.7):

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
directly. The SPARQL query is evaluated the following way:

1. get next triple pattern _tp_ in query _q_
  1. retrieve associated fragment _f_
  2. for each triple _t_ in _f_
    1. generate mapping _µ_ such that _µ(tp) = t_
    2. create _q'_ by removing tp and applying mu to remaining triple patterns
    3. if _q'_ is empty
      1. initialize _Ω_ with empty mapping
    4. else
      1. get _Ω_, set of mappings for _q'_ (recursive call)
2. merge _µ_ with all _µ'_ in _Ω_ compatible with _µ_
3. return _Ω_

This algorithm is the one defined in "Querying Datasets on the Web with High Availability",
from Verborgh et al., with the difference that the order in which query patterns appear
is statically define before query evaluation.

An important consideration in TPF is pagination. Yet, it is less relevant in our current
field of study (where data fragmentation is to be avoided), which is why we did not
consider that aspect. In our implementation, only whole fragments are retrieved by the client.

However, it is known that triple pattern ordering greatly influences query evaluation. We
therefore consider the case where queries were optimized before being evaluated, based on
statistics on the dataset that were computed offline. Under the assumption that no pagination
is used, optimizing the query beforehand is equivalent to relying on online estimations provided
for each fragment. Both algorithms are greedy, iterating over triple patterns in descending order
by selectivity. See next section for implementation details on query optimization.

### Query optimization

The ARQ module from Apache Jena includes a reference implementation of SPARQL query
optimization (see the associated
[technical report](http://markusstocker.com/26fe0502-b1c3-49e9-a90a-582d938ca158)).
Statistics on the dataset are first produced through a `StatsCollector` and stored in a
separate file:

```java
String fstats = "micro-lubm-stats.sse";
Model m = FileManager.get().loadModel("some_dataset.ttl");
StatsCollector c = Stats.gather(m.getGraph());
Stats.write(fstats, c.results());
```

This file is then used to construct an instance of `TransformReorder` that will processes
the triple patterns of a given query (which is assumed to run over the same dataset):

```java
Query q = QueryFactory.create("some SPARQL query string");
Op op = Algebra.compile(q);
Transform t = new TransformReorder(ReorderLib.weighted(fstats));
Op optimizedOp = Transformer.transform(t, op);
```

## Results

### Memory footprint

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

Sizes are expressed in byte. HDT headers were not included in the results.

### Query processing time

|     | EXI processing time | Total time | Number of triples | Result size (RDF/EXI) |
| --- | ------------------- | ---------- | ----------------- | --------------------- |
| Q1  | 40                  | 140        | 2                 | 203                   |
| Q3  | 31                  | 159        | 8                 | 495                   |
| Q6  | 16                  | 129        | 26                | 1826                  |
| Q8  | 71                  | 646        | 53                | 2202                  |
| Q9  | 82                  | 924        | 15                | 608                   |

Execution times expressed in clock ticks (C type `clock_t`). On micro-controllers like the ESP9266, this roughly corresponds to times in millisecond.

### Exchange volume

|     | µSPARQL query | TPF query | TPF query (optimized) | µSPARQL result | TPF result | TPF result (optimized) | Number of mappings |
| --- | ------------- | --------- | --------------------- | -------------- | ---------- | ---------------------- | ------------------ |
| Q1 | 203 | 689 | 689 | 203 | 645 | 645 | 1 |
| Q3 | 209 | 1890 | 480 | 495 | 1792 | 504 | 4 |
| Q6 | 67 | 67 | 67 | 1826 | 1826 | 1826 | 26 | 
| Q8 | 278 | 2310 | 2071 | 2202 | 2202 | 2202 | 26 | 
| Q9 | 302 | 3650 | 4209 | 608 | 4092 | 2676 | 3 |
