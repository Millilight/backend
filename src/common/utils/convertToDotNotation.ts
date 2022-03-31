const convertToDotNotation = (obj, newObj = {}, prefix = '') => {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      convertToDotNotation(obj[key], newObj, prefix + key + '.');
    } else {
      newObj[prefix + key] = obj[key];
    }
  }

  return newObj;
};

export default convertToDotNotation;
