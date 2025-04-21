import { countries } from 'countries-list';

export const getCountryNames = () => {
  return Object.values(countries)
    .map(country => country.name)
    .sort((a, b) => a.localeCompare(b));
};