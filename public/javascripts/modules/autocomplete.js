function autocomplete(input, latInput, lngInput) {
  if(!input) return;

  // create a variable with the selected place
  const dropdown = new google.maps.places.Autocomplete(input);

  // when a place is added to the dropdown variable populate the lat and lng fields
  dropdown.addListener('place_changed', () => {
    // grab the place when it is selected from the dropdown
    const place = dropdown.getPlace();
    // populate the form's #lat field with the place's latitude
    latInput.value = place.geometry.location.lat();
    // populate the form's #lng field with the place's longitude
    lngInput.value = place.geometry.location.lng();
  });

  // prevent the form from submitting when 'enter' is pressed
  input.on('keydown', (e) => {
    if (e.keycode === 13) e.preventDefault();
  });


}

export default autocomplete;