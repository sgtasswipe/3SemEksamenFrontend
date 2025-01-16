document.addEventListener("DOMContentLoaded", () => {
    const createOrderBtn = document.getElementById("create-order");
    createOrderBtn.addEventListener("click", () => showCustomerInputDialog());

    function showCustomerInputDialog() {
        if (document.querySelector('.customer-dialog'))
            return;
        const dialog = document.createElement("div");
        dialog.className = "customer-dialog";
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Create New Delivery</h3>
                <p>Input Address where you want the pizza delivered:</p>
                <input class="address" type="text" placeholder="Enter Address" required>
                <p>Input Pizza ID (1, 2, 3, 4, 5):</p>  
                <input class="piId" type="number" placeholder="Enter Pizza ID" min="1" max="5" required>
                <div class="dialog-actions">
                    <button class="submit-btn">Submit</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `; //todo Pizza dropdown?

        // Append dialog to the document
        document.body.appendChild(dialog);

        // Add event listeners to dialog buttons
        const submitBtn = dialog.querySelector(".submit-btn");
        const cancelBtn = dialog.querySelector(".cancel-btn");
        const piIdInput = dialog.querySelector(".piId");
        const addressInput = dialog.querySelector(".address");

        submitBtn.addEventListener("click", () => {
            const piId = piIdInput.value.trim();
            const address = addressInput.value.trim();

            if (!piId || !address) {
                alert("Both fields are required!");
                return;
            }

            createNewDelivery(piId, address);
            document.body.removeChild(dialog); // Remove dialog after submission
            window.location.reload() // todo temp fix for getting new orders on the list

        });

        cancelBtn.addEventListener("click", () => {
            document.body.removeChild(dialog); // Remove dialog if canceled
        });
    }

    function createNewDelivery(piId, address) {
        fetch(`http://localhost:8080/deliveries/add?pizzaId=${piId}&address=${encodeURIComponent(address)}`, {
            method: "POST",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to create delivery. Pizza ID: ${piId}, Address: ${address}`);
                }
                return response.json();
            })
            .then((data) => {
                alert(`Order created successfully! Expected delivery time: ${data.expectedDeliveryTime}`);
            })
            .catch((error) => {
                console.error("Error creating delivery:", error);
                alert("Failed to create delivery. Please try again.");
            });
    }
});
