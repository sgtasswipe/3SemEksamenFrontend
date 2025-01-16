document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("orders-table-body");
    const createbtn = document.getElementById("create-drone");
    let selectedDroneId = null;

    setInterval(fetchOrders, 60000);
    fetchOrders();

    function fetchOrders() {
        fetchData("http://localhost:8080/deliveries")
            .then(data => {
                console.log(data)
                data.sort((a, b) => new Date(a.expectedDeliveryTime) - new Date(b.expectedDeliveryTime));
                updateTable(data);
            })
            .catch(error => console.error("Error fetching deliveries:", error));
    }

    function fetchData(url, options = {}) {
        return fetch(url, options)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
                return response.json();
            });
    }

    function fetchDrones(dropdown) {
        fetchData("http://localhost:8080/drones")
            .then(drones => {
                dropdown.innerHTML = "<option value=''>Select a Drone</option>";
                drones.forEach(drone => {
                    if (drone.status === 'I_DRIFT') {
                        console.log(drone)
                        const option = document.createElement("option");
                        option.value = drone.id;
                        option.textContent = `Drone ${drone.id}`;
                        dropdown.appendChild(option);
                    }
                });
            })
            .catch(error => console.error("Error fetching drones:", error));
    }

    function updateTable(data) {
        tableBody.innerHTML = ""; // Clear the table
        data.forEach(delivery => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${delivery.id}</td>
                <td>${delivery.pizza.title} (${delivery.pizza.price} DKK)</td>
                <td>${delivery.address}</td>
                <td>${formatDateTime(delivery.expectedDeliveryTime)}</td>
                <td>${delivery.actualDeliveryTime ? formatDateTime(delivery.actualDeliveryTime) : "Not Delivered"}</td>
            `;

            // Action buttons
            const actionCell = document.createElement("td");
            const actionButton = document.createElement("button");
            if (delivery.drone) {
                actionButton.textContent = "Complete Delivery";
                actionButton.addEventListener("click", () => completeDelivery(delivery.id));
            } else {
                actionButton.textContent = "Assign Drone";
                actionButton.addEventListener("click", () => assignDroneToDelivery(delivery.id, selectedDroneId));

                const dropDownDrone = document.createElement("select");

                fetchDrones(dropDownDrone); // Populate the dropdown
                dropDownDrone.addEventListener("change", () => {
                    selectedDroneId = dropDownDrone.value;
                });
                actionCell.appendChild(dropDownDrone)
            }
            actionCell.appendChild(actionButton);
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });
    }

    function assignDroneToDelivery(deliveryId, droneId) {
        if (!droneId) {
            alert("Please select a drone.");
            return;
        }
        fetchData(`http://localhost:8080/deliveries/schedule?deliveryId=${deliveryId}&droneId=${droneId}`, {method: "POST"})
            .then(() => {
                alert("Drone assigned successfully!");
                fetchOrders();
            })
            .catch(error => console.error("Error assigning drone:", error));
    }

    function completeDelivery(deliveryId) {
        fetchData(`http://localhost:8080/deliveries/finish?deliveryId=${deliveryId}`, {method: "POST"})
            .then(() => {
                alert("Delivery completed successfully!");
                fetchOrders();
            })
            .catch(error => console.error("Error completing delivery:", error));
    }

    function addDrone() {
        fetchData("http://localhost:8080/drones/add", {method: "POST"})
            .then(() => alert("New Drone created!"))
            .catch(error => console.error("Error creating drone:", error));
    }

    createbtn.addEventListener("click", addDrone);

    function formatDateTime(dateTime) {
        const options = {year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"};
        return new Date(dateTime).toLocaleString("en-US", options);
    }


    // DRONE SIM
    //todo export if possible to standalone js file for better overview
    const droneSimBtn = document.getElementById('drone-simulator')

    droneSimBtn.addEventListener("click", () => startDroneSim())

    async function startDroneSim() {
        try {
            const deliveryQue = await fetch("http://localhost:8080/deliveries/queue")
            const deliveries = await deliveryQue.json();
            if (deliveries.length === 0) {
                alert("No Unassigned deliveries at this point in time")
                return;
            }
            const oldestDelivery = deliveries[0]
            const droneResponse = await fetch("http://localhost:8080/drones")
            const drones = await droneResponse.json();
            const availableDrones = drones.filter(d => d.status === "I_DRIFT");
            if (availableDrones === 0) {
                alert("No drones available at this time. Create a new drone or fix the old ones")
                return;
            }
            const randomDrone = availableDrones[Math.floor(Math.random() * availableDrones.length)]
            await assignDroneToDelivery(oldestDelivery.id, randomDrone.id)
            setTimeout(async () => {
                await completeDelivery(oldestDelivery.id);}, 5000);
        } catch (error) {
            console.log("Error starting drone simulation", error)
        }


        /* function startDroneSim() {
       const spinner = document.getElementById("spinner");
       spinner.style.display = "block"; // Show spinner
       fetch("http://localhost:8080/deliveries/queue", {}).then(response => response.json())
           .then(deliveries => {

               if (deliveries.length === 0) {
                   alert("No Unassigned Deliveries at this time.")
                   return;
               }
               const oldestDelivery = deliveries[0];
               fetch("http://localhost:8080/drones",).then(response => response.json())
                   .then(drones => {

                       const listOfAvailableDrones = drones.filter(d => d.status === "I_DRIFT");
                       if (listOfAvailableDrones === 0) {
                           alert("No drones available at this time. Create a new drone or fix the old ones")
                           return
                       }
                       let randomDrone = listOfAvailableDrones[Math.floor(Math.random() * listOfAvailableDrones.length)]
                       assignDroneToDelivery(oldestDelivery.id, randomDrone.id)
                       spinner.style.display = "none"
                       setTimeout(() => completeDelivery(oldestDelivery.id), 6000)

                   })
           })
   }*/  // new version was created with async await instead of nested call-back hell :D
    }
});
