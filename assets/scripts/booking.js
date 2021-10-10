/*This script handles taking of name and contact information.
consumes pending booking api for pending booking creation
handles payment
creates booking
sends notification of booking to email and phone
*/
$(document).ready(function(){
    function createPendingBooking(seatBooking){
        $.ajax({
            url: "http://localhost:55932/api/booking/create/pendingbooking",
            method: "POST",
            data: {
                "SeatNo": pendingBooking["SeatNo"],
                "TravelDateId": pendingBooking["TravelDateId"],
                "VCTRTid": pendingBooking["VCTRTid"],
                "CustomerPhone": pendingBooking["CustomerPhone"],
                "CustomerEmail": pendingBooking["CustomerEmail"]
            },
            success : function(response_data, status, xhr){
                //
            }
        });
    }
});