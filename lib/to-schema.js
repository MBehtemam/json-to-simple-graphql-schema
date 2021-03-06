/**
 * Copyright (c) [2018]-present, Walmart Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License."
 */

"use strict";

const isInteger = require("lodash.isinteger");
const isBoolean = require("lodash.isboolean");
const isNumber = require("lodash.isnumber");
const isObject = require("lodash.isobject");
const _set = require("lodash.set");

const transformPrimitive = (key, value) => {
  if (isInteger(value)) {
    return "Int";
  }
  if (isBoolean(value)) {
    return "Boolean";
  }
  if (isNumber(value)) {
    return "Float";
  }
  return "String";
};

const toSchema = input => {
  const result = {};
  const processedItemsCache = [];
  const stack = [{ obj: input, path: "" }];

  while (stack.length > 0) {
    const { obj, path } = stack.pop();

    Object.keys(obj).forEach(key => {
      let currentValue = obj[key];

      if (!Array.isArray(currentValue) && !isObject(currentValue)) {
        const newObjValue = transformPrimitive(key, currentValue);
        const newObjValuePath = path ? `${path}.` : "";
        _set(result, `${newObjValuePath}${key}`, newObjValue);
        return;
      }

      // all this to guard against circular refs
      if (processedItemsCache.some(o => o === currentValue)) {
        return;
      }

      processedItemsCache.push(currentValue);

      const pathPrefix = path ? `${path}.` : "";
      const newPath = `${pathPrefix}${key}`;

      // only use the first element in the array since we're assuming the same type for all
      // array elements
      if (Array.isArray(currentValue)) {
        currentValue = [currentValue[0]];
      }

      stack.push({
        obj: currentValue,
        path: newPath
      });
    });
  }

  processedItemsCache.splice(0, processedItemsCache.length);
  return result;
};

module.exports = { toSchema };
