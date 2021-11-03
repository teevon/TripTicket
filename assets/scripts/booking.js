/*This script handles taking of name and contact information.
consumes pending booking api for pending booking creation
handles payment
creates booking
sends notification of booking to email and phone
*/
$(document).ready(function(){

    $("#make-payment").on("click", function(e){
        $("#confirm-booking").modal("hide");
        payAndBook();
    });

    function payAndBook(){
        $.ajax({
            url: "http://localhost:55932/api/booking/create/pendingbooking",
            method: "POST",
            data: {
                "SeatNo": pendingBooking["SeatNo"],
                "TravelDateId": pendingBooking["TravelDateId"],
                "VCTRTid": pendingBooking["VCTRTid"],
                "CustomerPhone": pendingBooking["CustomerPhone"],
                "CustomerEmail": pendingBooking["CustomerEmail"],
                "FullName": pendingBooking["FullName"]
            },
            success : function(response_data, status, xhr){
                var pending = response_data["ResponseData"];
                $.ajax({
                    url: "http://localhost:55932/api/payment/reference",
                    method: "GET",
                    success: function(response, status, xhr){
                        //$("#confirm-booking").modal("hide");
                        booking["CustomerEmail"] = pending["CustomerEmail"];
                        booking["CustomerPhone"] = pending["CustomerPhone"];
                        booking["PaymentReference"] = response;
                        booking["SeatNo"] = pending["SeatNo"];
                        booking["DVCTRTid"] = pending["DVCTRTid"]
                        payWithPaystack(response["ResponseData"], parseInt(pending["AmountDue"]));
                    }
                });
            }
        });
    }

    // Set up confirm modal before paying

    function payWithPaystack(paymentReference, amountDue){
        //validate booking parameters first before initiating payment
		let handler = PaystackPop.setup({
			key: 'pk_test_acedf4103ce109ffc0d05ab0f3cfd44767a3e5fb',
			email: pendingBooking["CustomerEmail"],
			amount: amountDue * 100,
			ref: paymentReference,
			metadata: {
				custom_fields: [
				   {
				   	 display_name: "Mobile Number",
				   	 variable_name: "mobile_number",
				   	 value: pendingBooking["CustomerPhone"]
				   }
				]
			},
			callback: function(response) {
                if(response.status == "success"){
                    $.ajax({
                        url: "http://localhost:55932/api/payment/store",
                        method: "POST",
                        data: {
                            "AmountPaid" : amountDue, "TravelDayId" : pendingBooking["TravelDateId"], "VCTRTId" : pendingBooking["VCTRTid"], "SeatNo": booking["SeatNo"],
                            "PaymentReference" : response.reference, "CustomerName": booking["FullName"], "CustomerEmail": booking["Email"], "CustomerPhone": booking["Phone"]
                        },
                        success : function(response_data, status, xhr){
                            if(xhr.status == 200){
                                //make booking
                                $.ajax({
                                    url: "http://localhost:55932/api/booking/create",
                                    method: "POST",
                                    data: {
                                        "DVCTRTid" : booking["DVCTRTid"], "SeatNo": booking["SeatNo"], "AmountPaid": response.amount,
                                        "PaymentReference" : response.reference, "CustomerPhone": booking["CustomerPhone"],
                                        "CustomerEmail": booking["CustomerEmail"], "FullName" : booking["FullName"]
                                    },
                                    success : function(data, stat, xr){
                                        //process results from booking attempt
                                        $("#Phone").val("");
                                        $("#Email").val("");
                                        $("#FullName").val("");
                                        cuteAlert({
                                            type: "success",
                                            title: "Booking Successful",
                                            message: "Booking details have been sent to your email or phone",
                                            buttonText: "Okay"
                                          }).then(() => {
                                            self.location = "booking.php?r"
                                          });
                                    }
                                });
                            } else {
                                console.log("Response Data: ");
                                console.log(response_data);
                                cuteAlert();
                                payWithPaystack(paymentReference, amountDue);
                                if(confirm("Would you like to retry payment?")){
                                    
                                } else {
                                    //show confirm modal
                                }
                            }
                        }
                    })
                } else {
                    cuteAlert({
                        type: "question",
                        title: "Payment failed",
                        message: "Would you like to retry payment?",
                        closeStyle: "circle"
                    }).then(
                        function(success){
                            payWithPaystack(paymentReference, amountDue);
                        },
                        function(failure){
                            //Reset booking Time
                        }
                    );
                    //payWithPaystack(paymentReference, amountDue);
                }
                
			},
			onClose: function(){
                //self.location="verify.php?paymentReference="+paymentReference;
			}
		});
		handler.openIframe();
    }

    $("#paystack-pay").on("click", function(){
        $.ajax({
            url: "http://localhost:55932/api/payment/reference",
            method: "GET",
            success: function(response_data, status, xhr){
                $("#confirm-booking").modal("hide");
                payWithPaystack(response_data["ResponseData"]);
            }
        });
    });

    function ResetValues(){
        booking["DVCTRTid"] = null;
        booking["SeatNo"] = null;
        booking["CustomerPhone"] = null;
        booking["CustomerEmail"] = null;
        booking["FullName"] = null;
        pendingBooking["SeatNo"] = null;
        pendingBooking["TravelDateId"] = null;
        pendingBooking["VCTRTid"] = null;
        pendingBooking["CustomerPhone"] = null;
        pendingBooking["CustomerEmail"] = null;
        pendingBooking["FullName"] = null;
    }

    function ResetFields(){
        //
    }
});