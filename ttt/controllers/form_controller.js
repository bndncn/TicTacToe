$(document).ready(function() {
    $('#add').submit( function () {    
        $.ajax({   
            type: 'POST',
            data : $(this).serialize(),
            url: '/../adduser',   
            success: function(data){
                $("#results").html(data);                       
            }   
        });    
    });
});
