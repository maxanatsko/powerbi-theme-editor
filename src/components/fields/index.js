import { StringField } from './StringField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { ColorField } from './ColorField';
import { EnumField } from './EnumField';
import { ObjectField } from './ObjectField';
import { ArrayField } from './ArrayField';
import { IconField } from './iconField';
import { TransparencyField } from './TransparencyField';

export const fieldComponents = {
  string: StringField,
  number: NumberField,
  integer: NumberField,
  boolean: BooleanField,
  array: ArrayField,
  object: ObjectField,
  enum: EnumField,
  color: ColorField,
  icon: IconField,
  transparency: TransparencyField
};