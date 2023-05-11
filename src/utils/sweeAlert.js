import Swal from 'sweetalert2';

export const alerts = {
  regular: function (title, message, icon) {
    Swal.fire(title, message, icon);
  },
  titleOnly: function (title, icon) {
    Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 1500,
    });
  },
};
