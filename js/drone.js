
document.addEventListener("DOMContentLoaded", ()=> {
const droneTable = document.getElementById("drone-table-body")
 getDrones();
    async function getDrones() {
        droneTable.innerHTML=""
        const response = await fetch("http://localhost:8080/drones")
        const data = await response.json();
        console.log(data)
        data.forEach(drone => {
            const row = document.createElement("tr")
            row.innerHTML = ` <td>${drone.id}</td>
                <td>${drone.serialUUID}  </td>
                <td>${drone.status}</td>`;

            droneTable.appendChild(row);
    })
}})