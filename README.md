# punkt-oppslag-api

Hente ut alle data i et kartpunkt basert på koordinater

- [API documentation](http://punkt.artsdatabanken.no/)

## Build

APIet bygges som et [Docker image](https://cloud.docker.com/u/artsdatabanken/repository/docker/artsdatabanken/punkt-oppslag-api).

Data lastes av https://github.com/Artsdatabanken/punkt-oppslag-lastejobb som lager en SQLite indeks som legges i en katalog som mountes i Docker containeren.
