import { StringField } from './StringField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { ColorField } from './ColorField';
import { EnumField } from './EnumField';
import { ObjectField } from './ObjectField';
import { ArrayField } from './ArrayField';

export const fieldComponents = {
  string: StringField,
  number: NumberField,
  integer: NumberField,
  boolean: BooleanField,
  color: ColorField,
  enum: EnumField,
  object: ObjectField,
  array: ArrayField,
};