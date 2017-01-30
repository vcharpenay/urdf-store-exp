# Experiments on the µRDF store

Test sets and queries were derived from the [Lehigh University Benchmark (LUBM)](http://swat.cse.lehigh.edu/projects/lubm/).

## Test sets & queries

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

UBA profile: TODO

TPF: no pagination, both with query optimization (provided by Jena) and without (original LUBM queries). The query optimization simulates the greedy algorithm described in the original paper.

## Results

### Memory footprint

TODO

### Query processing time

|     | EXI processing time | Total time | Number of triples | Result size (RDF/EXI) |
| --- | ------------------- | ---------- | ----------------- | --------------------- |
| Q1  | 40                  | 140        | 2                 | 203                   |
| Q3  | 31                  | 159        | 8                 | 495                   |
| Q6  | 16                  | 129        | 26                | 1826                  |
| Q8  | 71                  | 646        | 53                | 2202                  |
| Q9  | 82                  | 924        | 15                | 608                   |

Execution times expressed in clock ticks (C type `clock_t`). On the ESP9266, this roughly corresponds to times in millisecond.
