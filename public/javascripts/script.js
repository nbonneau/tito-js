$(function() {
    setSelectHourOption('home_time', '06:00', '22:00');
    setSelectHourOption('work_time', '06:00', '22:00');

    setRangeTime('home_range', 0, 30, 10);

    $('#form_result').submit(onSubmitForm);
});

function onSubmitForm(e) {
    e.preventDefault();

    $('.field-error').remove();

    const dataArray = $('#form_result').serializeArray()
    const dataQuery = $('#form_result').serialize();

    const requiredFields = [{
        name: 'home_addr',
        type: 'input'
    }, {
        name: 'work_addr',
        type: 'input'
    }];

    let error = false;
    requiredFields.forEach((fieldData) => {
        const field = dataArray.find((data) => data.name === fieldData.name);
        const fieldElement = $(fieldData.type + '[name="' + fieldData.name + '"]');
        if (fieldElement) {
            fieldElement.removeClass('with-error');
            fieldElement.addClass('no-error');
        }
        if (!field.value) {
            error = true;
            fieldElement.removeClass('no-error');
            fieldElement.addClass('with-error');
            fieldElement.before('<p class="field-error">This field is required</p>');
        }
    });

    if (!error) {
        $('#loader').css('display', 'inline-block');
        $('#submit').css('display', 'none');
        $.ajax({
                url: 'http://localhost:3000/data?' + dataQuery,
                data: '',
                method: 'GET',
                dataType: 'html'
            }).done(function(data) {
                console.log('success', data);
            })
            .fail(function(err) {
                console.log('error', err);
                $('.api-error').remove();
                $('#submit').before('<p class="api-error">' + err.message + '</p>');
            })
            .always(function() {
                $('#loader').css('display', 'none');
                $('#submit').css('display', 'inline-block');
            });
    }
}

/**
 * 
 * @param {string} selectName The select HTML name
 * @param {number} start      Start range
 * @param {number} end        End range
 * @param {number} range      Range
 */
function setRangeTime(selectName, start, end, range) {

    const select = $('select[name="' + selectName + '"]');

    for (let i = start; i <= end; i += range) {

        const option = $('<option></option>');
        const str = '+/- ' + i + 'min';

        option.val(i);
        option.html(str);

        select.append(option);
    }
}

/**
 * Set options in a select HTML element with hours between two dates
 * Each option has as value HH:mm 
 * 
 * @param {string} selectName The HTML select name
 * @param {string} from       Date to start in format HH:mm
 * @param {string} to         Date to end in format HH:mm
 */
function setSelectHourOption(selectName, from, to) {

    const select = $('select[name="' + selectName + '"]');

    let dateStart = moment(from, "HH:mm");
    let dateEnd = moment(to, "HH:mm");

    dateStart = dateStart < dateEnd ? dateStart : dateEnd;
    dateEnd = dateEnd > dateStart ? dateEnd : dateStart;

    while (dateStart.unix() < dateEnd.unix()) {

        const option = $('<option></option>');
        const str = dateStart.format('HH:mm');

        option.val(str);
        option.html(str);

        select.append(option);

        dateStart.add(30, 'm');
    }
}