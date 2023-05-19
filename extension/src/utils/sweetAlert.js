import Swal from 'sweetalert2';

export const alerts = {
  regular: function (title, message, icon) {
    return Swal.fire(title, message, icon);
  },
  titleOnly: function (title, icon) {
    return Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 1500,
    });
  },
  needConfirmation: function (title, text, confirmText, icon) {
    return Swal.fire({
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonColor: '#3a6ff7',
      cancelButtonColor: '#a4a4a3',
      confirmButtonText: confirmText,
      icon: icon,
    });
  },
};
