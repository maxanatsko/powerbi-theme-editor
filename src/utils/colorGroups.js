// Color grouping configuration
export const colorGroups = {
  "Text Colors": [
    "foreground",
    "firstLevelElements", 
    "secondLevelElements",
    "thirdLevelElements",
    "fourthLevelElements",
    "foregroundLight",
    "foregroundDark",
    "foregroundNeutralLight",
    "foregroundNeutralDark",
    "foregroundNeutralSecondary",
    "foregroundNeutralSecondaryAlt",
    "foregroundNeutralSecondaryAlt2",
    "foregroundNeutralTertiary",
    "foregroundNeutralTertiaryAlt",
    "foregroundSelected",
    "foregroundButton"
  ],
  "Background Colors": [
    "background",
    "backgroundLight",
    "backgroundNeutral",
    "backgroundDark",
    "secondaryBackground"
  ],
  "Status Colors": [
    "good",
    "neutral",
    "bad",
    "null",
    "disabledText"
  ],
  "Value Scale Colors": [
    "maximum",
    "center",
    "minimum"
  ],
  "Link Colors": [
    "hyperlink",
    "visitedHyperlink"
  ],
  "Accent Colors": [
    "accent",
    "tableAccent"
  ],
  "Special Elements": [
    "shapeStroke",
    "mapPushpin"
  ]
};

// Groups order to maintain consistent display
export const groupOrder = [
  "Text Colors",
  "Background Colors",
  "Status Colors",
  "Value Scale Colors",
  "Link Colors",
  "Accent Colors",
  "Special Elements"
];

// Helper function to determine if a field should be grouped
export const isColorField = (fieldName) => {
  return Object.values(colorGroups).some(group => group.includes(fieldName));
};

// Get group for a field
export const getFieldGroup = (fieldName) => {
  return Object.entries(colorGroups).find(([_, fields]) => 
    fields.includes(fieldName)
  )?.[0] || null;
};