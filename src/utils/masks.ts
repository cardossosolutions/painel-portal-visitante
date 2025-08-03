// Utilitários para máscaras de entrada
export const phoneMasks = {
  // Máscara para telefone fixo: (11) 3333-4444
  landline: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    }
  },

  // Máscara para celular: (11) 99999-9999
  mobile: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  },

  // Máscara automática que detecta se é fixo ou celular
  auto: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    // Se tem 11 dígitos e o terceiro dígito é 9, é celular
    if (numbers.length === 11 && numbers[2] === '9') {
      return phoneMasks.mobile(value);
    }
    // Se tem 10 dígitos, é telefone fixo
    else if (numbers.length === 10) {
      return phoneMasks.landline(value);
    }
    // Para números incompletos, usar lógica baseada no tamanho
    else if (numbers.length > 10) {
      return phoneMasks.mobile(value);
    } else {
      return phoneMasks.landline(value);
    }
  },

  // Remove a máscara e retorna apenas os números
  unmask: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  // Valida se o telefone está completo
  isValid: (value: string): boolean => {
    const numbers = phoneMasks.unmask(value);
    return numbers.length === 10 || numbers.length === 11;
  }
};

// Outras máscaras úteis
export const otherMasks = {
  // Máscara para CPF: 123.456.789-00
  cpf: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  },

  // Máscara para CNPJ: 12.345.678/0001-90
  cnpj: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  },

  // Máscara para CEP: 12345-678
  cep: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  }
};