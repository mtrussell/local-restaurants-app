import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

// use google maps api to create an autocomplete dropdown 
// and auto populate the lat and lng form fields
autocomplete( $('#address'), $('#lat'), $('#lng') );