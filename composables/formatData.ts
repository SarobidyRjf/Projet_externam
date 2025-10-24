export const useDateFormat = () => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const formatted = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });

    const parts = formatted.split(' ');
    if (parts.length === 3) {
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return parts.join(' ');
  };

  return { formatDate };
}


export const useFormatChiffreAffaire = () => {
  const formatChiffreAffaire = (value: string) => {
    return value.split('_').join(' ');
  };

  return { formatChiffreAffaire };
}

export const useFormatDateTime = () => {
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);

    const formatted = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const parts = formatted.split(' ');
    if (parts.length === 3) {
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return parts.join(' ');
  };

  return { formatDateTime };
}

export const useFormatName = () => {
  const getInitials = (firstName: string, lastName: string): string => {
    const parts = `${firstName} ${lastName}` // concat prénom + nom
      .trim()
      .split(/\s+/) // découpe sur espace

    return parts
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }

  return { getInitials }
}

