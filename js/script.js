//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});
$(function() {
    $(document).on('click', 'a.page-scroll', function(event) {
        var $anchor = $(this);
        $('.navbar-toggle').click()
    });
});
$(document).ready(function() {

    // Carousel swiping
    $(".carousel-inner").swipe( {
        //Generic swipe handler for all directions
        swipeLeft:function(event, direction, distance, duration, fingerCount) {
            $(this).parent().carousel('next');
        },
        swipeRight: function() {
            $(this).parent().carousel('prev');
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:0
    });

    // Change icons on click
    $('.navbar-toggle').click(function() {
        $(this).find("#nav-icon").toggleClass('open');
    });

    $('.up, .up-sm').click(function() {
        $(this).toggleClass('down');
    });
});
function showModal(text) {
    $("#modalText").remove();
    $('<p id="modalText">' + text + '</p>').appendTo('#modalTextBody');
    $('#textInformation').modal('show');
}
function sendPostRequest(url, parameterName, dataObjectId) {
    var xhr = new XMLHttpRequest();
    var body = parameterName + '=' + encodeURIComponent(document.getElementById(dataObjectId).value);
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById(dataObjectId).value='';
            showModal(xhr.responseText);
        }
    };
    xhr.send(body)
}
//validate form
$(document).ready(function(){
    jQuery.validator.setDefaults({
        errorPlacement: function (error, element) {
            if (element.attr('id')!='subscriptionText') {
                error.insertBefore(element.parent());
            }
        }
    });
    $('#alfaConformationForm').validate({
        rules: {
            alfaSMScode: {
                number: true,
                required: true
            }
        },
        highlight: function(element) {
            $(element).removeClass('success').addClass('error');
        },
        success: function(label) {
            label.remove();
        },
        submitHandler: function(form) {
            $.ajax({
                url: form.action,
                type: form.method,
                data: $(form).serialize(),
                success: function (response) {
                    var responseJSON = JSON.parse(response);
                    if (responseJSON.result=='ok') {
                        $('#alfaConformation').modal('close');
                        showModal("Зпрос был потвержден. Статус " + responseJSON.sms_status);
                    } else if (responseJSON.result=='error') {
                        $('#alfaConformation').modal('close');
                        showModal("Ошибка на сервере");
                    }
                }
            });
        }
    });
    $('#feedBackForm').validate({
        rules: {
            feedBack: {
                minlength: 3
            }
        },
        highlight: function(element) {
            $(element).removeClass('success').addClass('error');
        },
        success: function(label) {
            label.remove();
        },
        submitHandler: function(form) {
            if ($('#feedBack').val() || $('#feedBack').val().length >2) {
                sendPostRequest('email/send', 'text', 'feedBack');
            } else {
                showModal("Введите сообщения для отправки");
            }
        }
    });
    $('#subscriptionForm').validate({
        rules: {
            subscriptionText: {
                email: true
            }
        },
        highlight: function(element) {
            $(element).removeClass('success').addClass('error');
        },
        success: function(label) {
            label.remove();
        },
        submitHandler: function(form) {
            if ($('#subscriptionText').val() || $('#subscriptionText').val().length >2) {
                sendPostRequest('email/save', 'email', 'subscriptionText');
            } else {
                showModal("Введите email для подписки");
            }
        }
    });
    $('#cardRequestForm').validate({
        rules: {
            lastName: {
                minlength: 2,
                required: true
            },
            firstName: {
                required: true,
                minlength: 2
            },
            middleName: {
                minlength: 2
            },
            birthDate: {
                required: true,
                ukrainianDate: true
            },
            identCode: {
                required: true,
                minlength: 10,
                maxlength: 10,
                number: true
            },
            phone: {
                required: true,
                customphone: true
            },
            employment: {
                required: true
            },
            amount: {
                number: true
            },
            city: {
                ukrainianCity: true,
                required: true
            },
            email: {
                email: true
            }
        },
        highlight: function(element) {
            $(element).removeClass('success').addClass('error');
            $(element).closest('.control-group').removeClass('success').addClass('error');
        },
        success: function(label) {
            label.remove();
        },
        submitHandler: function(form) {
            $.ajax({
                url: form.action,
                type: form.method,
                data: $(form).serialize(),
                success: function(response) {
                    $('#cardModal').modal('hide');
                    var responseJSON = JSON.parse(response);
                    if (responseJSON.result=='false') {
                        showModal("запрос отклонен. Причина:" + responseJSON.error);
                    } else if (responseJSON.state=='reject') {
                        showModal("запрос отклонен. Причина:" + responseJSON.message);
                    } else if ($('#banks').val()=='|6' && responseJSON.verification != undefined) {//for alfa bank
                        createCookie('alfaSMSid', responseJSON.verification, 7);
                        $('#alfaSMSid').val(responseJSON.verification)
                        $('#alfaConformation').modal('show');
                    } else if ($('#banks').val()=='|6' && responseJSON.verification == undefined) {
                        showModal("Не верно указан телефон или идентификационый код");
                    } else if($('#banks').val()!='|6') {
                        showModal("Ваш запрос на получения карты принят.");
                    }
                }
            });
        }
    });
$.validator.addMethod(
    "ukrainianDate",
    function(value, element) {
        return value.match(/^\d\d?\.\d\d?\.\d\d\d\d$/);
    }, "Пожалуйста, введите дату в формате dd.mm.yyyy."
);
$.validator.addMethod('customphone', function (value, element) {
    return this.optional(element) || /^38\d{3}\d{7}$/.test(value);
}, "Пожалуйста, введите корректный телефон в формате 380xxxxxxxxx");
$.validator.addMethod(
    "ukrainianCity",
    function(value, element) {
        return value.match(/^[а-яА-Я]+$/);
    }, "Введите город кирилицей"
);
});
function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
};
function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};
function eraseCookie(name) {
    createCookie(name, "", -1);
};
function setBankId(id) {
   $("#banks").val(id);
   if (readCookie('alfaSMSid')!=null) {
       $('#alfaConformation').modal('show');
   }
};
$(document).ready(function () {
    $('#alfaCancel').click(function () {
        eraseCookie('alfaSMSid');
        $('#alfaConformation').modal('close');
    });
});




