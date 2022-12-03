const getAllKeysInArrayOfObjects = (arrayOfObj) => {

    const uniqueKeys = new Set();

    arrayOfObj.forEach(obj => {
        Object.keys(obj).forEach(k => uniqueKeys.add(k));
    });

    const keys = [...uniqueKeys];
    return keys
}

module.exports = { getAllKeysInArrayOfObjects }