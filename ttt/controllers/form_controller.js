$(document).ready(function() {
    
    $('#add').submit(function () {    
        $.ajax({   
            type: 'POST',
            data : $(this).serialize(),
            url: '/../adduser'   
        });    
    });

    $('#verify').submit(function () {    
        $.ajax({   
            type: 'POST',
            data : $(this).serialize(),
            url: '/../verify',
        });    
    });

    $('#login').submit(function () {    
        $.ajax({   
            type: 'POST',
            data : $(this).serialize(),
            url: '/../login'   
        });    
    });
});

