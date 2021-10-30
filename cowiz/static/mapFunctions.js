const toBorderDark = (id) => document.getElementById(id).classList.remove('border-danger');

let SDInput = document.getElementById('start_of_startDate');
let EDInput = document.getElementById('start_of_endDate');

const periodLength = () => parseInt(document.getElementById('periodLength').value);

function adjust_min_of_2nd_period(){
    if ((SDInput.value != '')){
        var vals = SDInput.value.split('-');
        var year = vals[0];
        var month = vals[1];
        var day = vals[2];
        var date = new Date(year, month-1, day);
        date.setDate(date.getDate() + periodLength());
        var month = parseInt(date.getMonth())+1
        if (month < 10){
            month = 0+month.toString();
        }
        var exactDate = date.getDate();
        if (exactDate < 10){
            exactDate = 0+exactDate.toString();
        }
        var x = EDInput.min = date.getFullYear() + "-" + month + "-" + exactDate;
    }
}

// ... ?
function monthName(m){
    if (m == '01') return "Jan";
    if (m == '02') return "Feb";
    if (m == '03') return "Mar";
    if (m == '04') return "Apr";
    if (m == '05') return "May";
    if (m == '06') return "Jun";
    if (m == '07') return "Jul";
    if (m == '08') return "Aug";
    if (m == '09') return "Sep";
    if (m == '10') return "Oct";
    if (m == '11') return "Nov";
    if (m == '12') return "Dec";
    if (m == 'Jan') return "01";
    if (m == 'Feb') return "02";
    if (m == 'Mar') return "03";
    if (m=="Apr") return "04";
    if (m=="Jun") return "06";
    if (m=='Jul') return "07";
    if (m == 'Aug') return "08";
    if (m == "Sep") return "09"; 
    if (m == "Oct") return "10";
    if (m == "Nov") return "11";
    if (m == "Dec") return "12";
}

function set_max_date(){
    var today = new Date();

    var end = new Date();
    
    end.setDate(today.getDate() - (periodLength()));
    var date = end.getFullYear()+'-'+(end.getMonth()+1)+'-'+end.getDate();
    var vals = date.split('-');
    var year = vals[0];
    var month = vals[1];
    var day = vals[2];
    if (month < 10){
        month = 0+month.toString();
    }
    if (day < 10){
        day = 0+day.toString();
    }
    var date = year +'-'+ month +'-'+ day;
    var maxEndDate = EDInput.max = date; 
    
    var start = new Date();
    start.setDate(today.getDate() - 2*(periodLength()));
    date = start.getFullYear()+'-'+(start.getMonth()+1)+'-'+start.getDate();
    vals = date.split('-');
    year = vals[0];
    month = vals[1];
    day = vals[2];
    if (month < 10){
        month = 0+month.toString();
    }
    if (day < 10){
        day = 0+day.toString();
    }
    date = year +'-'+ month +'-'+ day;
    var maxStartDate = SDInput.max = date;
}

function enable_2nd_calendar(){
    if ((SDInput.value != '') && (document.getElementById('periodLength').value != 0)){
        EDInput.disabled = false;
    }

    if ((document.getElementById('periodLength').value == 0) || (SDInput.value == '')){
        EDInput.disabled = true;
    }
}

function enable_1st_calendar(){
    if (document.getElementById('periodLength').value == 0){
        SDInput.disabled = true;
    }
    else{
        SDInput.disabled = false;
    }
}

function enableSubmit(){
    if (periodLength() === 0){
        document.getElementById('submit').classList.add('btn-danger');
        document.getElementById('submit').disabled = true;
    }
    else if((SDInput.value == '') || (EDInput.value == '')){
        document.getElementById('submit').classList.add('btn-danger');
        document.getElementById('submit').disabled = true;
    }
    else{
        document.getElementById('submit').classList.add('btn-dark');
        document.getElementById('submit').disabled = false;
    }
}

function setEnd(id){
    if (id == 'start_of_startDate'){
        var vals = SDInput.value.split('-');
    }
    else if (id == 'start_of_endDate'){
        var vals = EDInput.value.split('-');
    }
        var year = vals[0];
        var month = vals[1];
        var day = vals[2];
        var date = new Date(year, month-1, day);
        date.setDate(date.getDate() + periodLength()-1);
        var month = parseInt(date.getMonth())+1
        if (month < 10){
            month = 0+month.toString();
        }
        var exactDate = date.getDate();
        if (exactDate < 10){
            exactDate = 0+exactDate.toString();
        }
    if (id == 'start_of_startDate'){
        var x = document.getElementById('end_of_startDate').innerHTML =  exactDate + "-" + monthName(month) + "-" +date.getFullYear();
    }
    else if (id == 'start_of_endDate'){
        var x = document.getElementById('end_of_endDate').innerHTML = exactDate + "-" + monthName(month) + "-" +date.getFullYear();
    }
}

function resetDates(id){
    if (id != 'start_of_startDate'){
        
        if (id == 'start_of_endDate'){
            var vals = document.getElementById('end_of_startDate').innerHTML.split('-');
            var vals_end = EDInput.value.split('-');

            var date = new Date(vals[2], parseInt(monthName(vals[1]))-1, vals[0]);
            var date_end = new Date(vals_end[0], parseInt(vals_end[1])-1, vals_end[2]);

            if (date >= date_end){
                var x = SDInput.value = '';
                var y = document.getElementById('end_of_startDate').innerHTML = '-';
            }
        }

    }
    if (id != 'start_of_endDate'){
        
        if (id == 'start_of_startDate'){
            var vals = document.getElementById('end_of_startDate').innerHTML.split('-');
            var vals_end = EDInput.value.split('-');

            var date = new Date(vals[2], parseInt(monthName(vals[1]))-1, vals[0]);
            var date_end = new Date(vals_end[0], parseInt(vals_end[1])-1, vals_end[2]);

            if (date >= date_end){
                var x = EDInput.value = '';
                var y = document.getElementById('end_of_endDate').innerHTML = '-';
            }
        }
    }

    if (id == 'periodLength'){
            
            var vals = SDInput.value.split('-');
            var vals_end = EDInput.value.split('-');

            var date= new Date(vals[0], parseInt(vals[1])-1, vals[2]);
            var date_end = new Date(vals_end[0], parseInt(vals_end[1])-1, vals_end[2]);

            date.setDate(date.getDate() + periodLength());
            if (date >= date_end){
                var x = SDInput.value = '';
                var y = document.getElementById('end_of_startDate').innerHTML = '-';
                var z = EDInput.value = '';
                var a = document.getElementById('end_of_endDate').innerHTML = '-';
            }
            else{
            //    if (date != null)
                    setEnd('start_of_startDate');
                // if (date_end != null)
                    setEnd('start_of_endDate');
            }
            
            var vals_start = SDInput.value.split('-');
            var vals_end = EDInput.value.split('-');
            var today = new Date();

            var date_start = new Date(vals_start[2], parseInt(monthName(vals_start[1]))-1, vals_start[0]);
            date_start.setDate(date_start.getDate() + periodLength());
            
            if (date_start>=today.getDate()){
                var x = SDInput.value = '';
                var y = document.getElementById('end_of_startDate').innerHTML = '-';
            }

            var date_end = new Date(vals_end[2], parseInt(monthName(vals_end[1]))-1, vals_end[0]);
            date_end.setDate(date_end.getDate() + periodLength());
            if (date_end >= today.getDate()){
                var z = EDInput.value = '';
                var a = document.getElementById('end_of_endDate').innerHTML = '-';
            }
    }   
}

const loadingScreen = (id) => document.getElementById('iframe').src = "{{ url_for('static', filename='loading_screen.html') }}";