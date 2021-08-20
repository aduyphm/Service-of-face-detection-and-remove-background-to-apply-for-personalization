$(document).ready(function () {
  $('.select-option .option').click(function () {
    $('.select-option .option').each(function () {
      const $this = $(this)
      if ($this.hasClass('active')) {
        $this.removeClass('active')
      }
    })

    $(this).addClass('active')
  })

  $('#btn_submit').on('click', function () {
    const file = document.getElementById('upload').files[0];
    const option = $('.select-option .option.active').attr('data-id');
    const background = document.getElementById('uploadbackground').files[0];
    let option_background = background ? 2 : 1;
    // document.write(background)
    if (typeof file === 'undefined') {
      toastr["warning"]("Must choose file input", "");
      return false
    }

    const formData = new FormData();

    if (option_background === 1) {
      if (!option) {
        toastr["warning"]("Must choose option background or customize your own background", "");
        return false
      }
      else {
        formData.append('file', file);
        formData.append('option', option);
        formData.append('action', 'upload-file');
        formData.append('option_background', option_background);
      }
    }
    else if (option_background === 2) {
      formData.append('file', file);
      formData.append('background', background);
      formData.append('action', 'upload-file');
      formData.append('option_background', option_background);
    }
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
