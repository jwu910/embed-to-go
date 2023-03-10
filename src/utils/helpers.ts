import { IField } from "../App";

// Function for wrapping the entire embed after parsing
export const addCommandWrapper = (
  key: string,
  argStrings: string | string[]
): string => {
  return `{{ ${key} ${argStrings}\n}}`;
};

// Function for handling single string fields
export const handleStringEmbed = (
  field: string,
  fieldValue: string
): string => {
  return `"${field}" "${fieldValue}"\n`;
};

// Function for handling color string field
export const handleColorEmbed = (
  field: string,
  fieldValue: number | null
): string => {
  if (fieldValue === null) {
    return `"${field}" nil\n`;
  } else {
    return `"${field}" ${fieldValue}\n`;
  }
};

// Function for handling fields with object values
export const handleObjectEmbed = (
  field: string,
  fieldValue: object
): string => {
  if (field === "fields") {
    let objectEmbedStr = "( sdict\n";
    Object.entries(fieldValue).forEach(([key, value]) => {
      objectEmbedStr = objectEmbedStr + `"${key}" "${value}"\n`;
    });
    objectEmbedStr = objectEmbedStr + " )\n";
    return `${objectEmbedStr}`;
  } else {
    let objectEmbedStr = "( sdict\n";
    let dictString = "";
    Object.entries(fieldValue).forEach(([key, value]) => {
      dictString = dictString + `"${key}" "${value}"\n`;
    });
    objectEmbedStr = objectEmbedStr + dictString + ")\n";
    return `"${field}" ${objectEmbedStr}`;
  }
};

// Function for handling the 'fields' field
export const handleArrayEmbed = (
  field: string,
  fieldValue: IField[]
): string => {
  let sliceEmbedStr = "( cslice\n";
  fieldValue.forEach((i) => {
    let objectEmbed = handleObjectEmbed(field, i);
    sliceEmbedStr = sliceEmbedStr + objectEmbed;
  });
  return `"${field}" ${sliceEmbedStr}`;
};

export const parseKeys = (embed: Record<string, any>): string => {
  const embedCommandArray = Object.keys(embed)
    .map((key: string): any => {
      let returnVal;

      switch (key) {
        case "color":
          returnVal = handleColorEmbed(key, embed[key]);
          break;
        case "fields":
          returnVal = handleArrayEmbed(key, embed[key]);
          break;
        case "author":
        case "footer":
        case "image":
        case "provider":
        case "thumbnail":
        case "video":
          returnVal = handleObjectEmbed(key, embed[key]);
          break;
        case "description":
        case "title":
        case "type":
        case "url":
          returnVal = handleStringEmbed(key, embed[key]);
          break;
      }
      return returnVal;
    })
    .join("");

  return addCommandWrapper(
    "$embed := cembed",
    `( sdict\n${embedCommandArray})`
  );
};
