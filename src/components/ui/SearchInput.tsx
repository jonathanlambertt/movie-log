import { Search } from 'lucide-react-native';

import { FieldInput } from '@/components/ui/FieldInput';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

// Search flavour of FieldInput: magnifying glass, search return key.
export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search movies...',
  autoFocus,
}: Props) {
  return (
    <FieldInput
      icon={Search}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoFocus={autoFocus}
      returnKeyType="search"
    />
  );
}
