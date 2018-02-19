# SPITFIRE test sets

These data sets were used for the evaluation of SHDT in the following publication:

> H. Hasemann, A. Kroller, and M. Pagel, “RDF provisioning for the Internet of Things,”
> presented at the Internet of Things (IOT), 2012 3rd International Conference on the,
> 2012, pp. 143–150.

The XML files were provided by the authors themselves. Their work was part of a
European project called SPITFIRE, which aims at integrating Semantic Web technologies
in the Web of Things architecture. For an overview of SPITFIRE, see :

> D. Pfisterer et al., “SPITFIRE: toward a semantic web of things,” IEEE Communications
> Magazine, vol. 49, no. 11, pp. 40–48, Nov. 2011.

## JSON-LD compaction experiments

The following binary formats for RDF were compared:

| Format | Software used | Notes |
| --- | --- | --- |
| HDT | [hdt-cpp](https://github.com/rdfhdt/hdt-cpp) |  |
| k2-triples | _source code provided by the authors_ | Variant of HDT |
| EXI4JSON | [jsonld.js](https://github.com/digitalbazaar/jsonld.js) + [exificient.js](https://github.com/EXIficient/exificient.js) |  |
| CBOR | [jsonld.js](https://github.com/digitalbazaar/jsonld.js) + [node-cbor](https://github.com/hildjj/node-cbor) |  |
| RDF/EXI | [EXIficient GUI](https://github.com/EXIficient/exificient-gui) | XML Schema for RDF in [`/misc`](../misc) |

EXI4JSON and CBOR were both tested with two different contexts for each data set: a
_minimal_ context (including mappings only for the IRIs present in the data set) and
an _ontology-based_ context. We provide here the contexts we used for each data set
(`{dataset}.context.min.json` and `{dataset}.context.json` respectively).

### Results

|     | HDT | k2-triples | EXI4JSON (minimal context) | CBOR (minimal context) | EXI4JSON | CBOR | RDF/EXI |
| --- | ------------- | --------- | --------------------- | -------------- | ---------- | ---------------------- | ------------------ |
| btcsample0 | 5931 | 20698 | 5409 | 5949 | 8639 | 9711 | 12560 |
| incontextsensing | 1258 | 16053 | 925 | 1044 | 1235 | 1561 | 2390 |
| ssp | 56503 | 67734 | 69477 | 86618 | 121991 | 249702 | 133844 |

Sizes are in byte.
