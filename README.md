# punkt-oppslag-api

APIet bygges som et [Docker image](https://cloud.docker.com/u/artsdatabanken/repository/docker/artsdatabanken/punkt-oppslag-api).

Data lastes av https://github.com/Artsdatabanken/punkt-oppslag-lastejobb som lager en SQLite indeks som legges i en katalog som mountes i Docker containeren.

## Bruk

Urlen er satt sammen av lengdegrad og breddegrad i [WGS-84](https://no.wikipedia.org/wiki/World_Geodetic_System).

Eksempel: https://punkt.artsdatabanken.no/10.394399832777276,63.42919692753509
