function gramsToKg(grams, maxPlaces = 3) {
    return (parseFloat(grams) / 1000).toLocaleString(undefined, { maximumFractionDigits: maxPlaces });
}

export { gramsToKg };