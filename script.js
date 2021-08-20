$(document).ready(function () {

  $('#btn_submit').on('click', function () {
    const file = document.getElementById('upload').files[0];
    console.log(file);
    if (typeof file === 'undefined') {
      toastr["warning"]("Must choose file input", "");
      return false
    }

    const formData = new FormData();

    formData.append('file', file);
    formData.append('action', 'upload-file');

    // toastr for report successful submit
    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "2000",
      "hideDuration": "2000",
      "timeOut": "10000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

    toastr["warning"]("Pending result...", "")

    $.ajax({
      type: 'POST',
      dataType: 'json',
      cache: false,
      data: formData,
      url: 'handle.php',
      processData: false,
      contentType: false,
      success: function (data) {
        if (data.code && data.code === 200) {
          $('#detectionResult').attr('src', data.src)
          toastr["success"](data.time + " seconds", "Successfully!")
        } else {
          toastr["error"](data.message, "Error!")
        }
      },
      error: function () {

      }
    });

  })

});
