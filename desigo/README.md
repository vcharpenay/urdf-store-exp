# Siemens Desigo CC test set

This test set consists of the configuration of a Siemens
[Desigo CC](http://www.siemens.com/desigocc) instance exported as a
set of Thing Descriptions (TDs) as [defined by the W3C Web of
Things working  group](https://www.w3.org/TR/wot-thing-description/).

Desigo CC is an integration platform for building automation systems.
This data set includes metadata on a simulated automation system for
a single building.

## JSON-LD compaction experiments

The same experiments as described in [`/spitfire`](../spitfire) were
performed with this data set.

### Results

|     | HDT | k2-triples | EXI4JSON (minimal context) | CBOR (minimal context) | EXI4JSON | CBOR | RDF/EXI |
| --- | ------------- | --------- | --------------------- | -------------- | ---------- | ---------------------- | ------------------ |
| things | 360498 | 260154 | 653850 | 1363180 | 733061 | 2292866 | 958801 |