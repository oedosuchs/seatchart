// Main function to assign seats to students
function assignSeats() {
    // Get and clean up the list of student names entered in the text area
    const studentNames = [...new Set(
        document.getElementById('studentNames').value.trim().split('\n').map(name => name.trim()).filter(name => name)
    )];

    // Get the total number of seats available
    const totalSeats = parseInt(document.getElementById('totalSeats').value);

    // Get and clean up the reserved seats input
    const reservedSeatsInput = document.getElementById('reservedSeats').value.trim().split('\n').map(entry => entry.trim()).filter(entry => entry);
    const reservedSeats = {}; // Will hold the reserved seat assignments (name -> seat number)
    const reservedNames = []; // Will track names already assigned to reserved seats

    // Process each reserved seat entry (name: seat)
    for (const entry of reservedSeatsInput) {
        const [name, seat] = entry.split(':').map(item => item.trim()); // Split name and seat
        const seatNumber = parseInt(seat); // Convert seat number to integer

        // Validate seat assignment
        if (isNaN(seatNumber)) {
            alert(`${name}'s name is in the reserved seat list but no seat was specified.`); // Alert if seat number is missing
            return;
        }
        if (seatNumber < 1 || seatNumber > totalSeats) {
            alert(`Invalid seat assignment: "${name}" is assigned to seat ${seatNumber}, but there are only ${totalSeats} seats available.`);
            return; // Alert if the seat number is out of range
        }

        // Ensure each name has a unique identifier if there are duplicate names
        const uniqueName = name + (reservedNames.filter(n => n.startsWith(name)).length + 1);
        reservedSeats[uniqueName] = seatNumber; // Assign the seat to the name
        reservedNames.push(name); // Add the name to the reserved list
    }

    // Create a set of reserved names for quick lookup
    const reservedNameSet = new Set(reservedNames);

    // Filter out students who are already assigned reserved seats
    const unassignedStudents = studentNames.filter(name => !reservedNameSet.has(name));

    // Determine available seats (those not in reservedSeats)
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !Object.values(reservedSeats).includes(seat));

    // If there aren't enough available seats for unassigned students, show an error
    if (unassignedStudents.length > availableSeats.length) {
        alert('Not enough seats for all students.');
        return;
    }

    // Distribute seats evenly for unassigned students, avoiding reserved seats
    const evenlyDistributedSeats = distributeSeatsEvenly(availableSeats, unassignedStudents.length, Object.values(reservedSeats));

    // Randomize seat assignments for unassigned students
    shuffleArray(evenlyDistributedSeats);

    // Combine reserved seat assignments with new ones
    const seatAssignments = { ...reservedSeats };

    // Assign seats to unassigned students
    unassignedStudents.forEach((student, index) => {
        seatAssignments[student] = evenlyDistributedSeats[index];
    });

    // Display the final seat assignments in the result section
    displayResults(seatAssignments, reservedNames);

    // Show the "Print" button once seat assignments are done
    document.getElementById('printButton').style.display = 'block';
}

// Function to shuffle an array in random order (used to randomize seat assignments)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to distribute available seats evenly across students while avoiding reserved seats
function distributeSeatsEvenly(seats, count, reservedSeats) {
    const avoidanceSeats = new Set();

    // For each reserved seat, avoid adjacent seats
    reservedSeats.forEach(seat => {
        if (seat > 1) avoidanceSeats.add(seat - 1);
        if (seat < seats.length) avoidanceSeats.add(seat + 1);
    });

    // Prioritize seats that are not adjacent to reserved ones
    const prioritizedSeats = seats.filter(seat => !avoidanceSeats.has(seat));
    const fallbackSeats = seats.filter(seat => avoidanceSeats.has(seat));

    // Calculate how many students to assign to each "chunk" of available seats
    const step = Math.floor(prioritizedSeats.length / count) || 1;
    const distributedSeats = [];
    
    // Distribute seats across students
    for (let i = 0; i < count; i++) {
        const seat = prioritizedSeats[i * step] || fallbackSeats[i % fallbackSeats.length];
        distributedSeats.push(seat);
    }
    return distributedSeats;
}

// Function to display the seat assignments in the result section of the page
function displayResults(seatAssignments, reservedNames) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<hr /> <h2>Seat Assignments</h2>';

    const container = document.createElement('div');
    container.classList.add('container-columns');

    const column1 = document.createElement('div');
    column1.classList.add('column');
    const column2 = document.createElement('div');
    column2.classList.add('column');

    let index = 0;

    // Sort seat assignments alphabetically by student name
    const sortedSeatAssignments = Object.entries(seatAssignments).sort(([a], [b]) => a.localeCompare(b));

    sortedSeatAssignments.forEach(([student, seat], idx) => {
        // Display the name without numeric suffix for reserved names
        const displayName = reservedNames.includes(student.replace(/\d+$/, '')) ? student.replace(/\d+$/, '') : student;

        const seatPair = document.createElement('div');
        seatPair.classList.add('seat-pair');
        seatPair.innerHTML = `<span>${displayName}</span><span>${seat}</span>`; // Format seat and student name

        // Alternate between columns for better layout
        if (index % 2 === 0) {
            column1.appendChild(seatPair);
        } else {
            column2.appendChild(seatPair);
        }

        index++;
    });

    container.appendChild(column1);
    container.appendChild(column2);

    resultDiv.appendChild(container);
}

// Function to handle printing of the results in a styled format
function printResults() {
    const resultDiv = document.getElementById('result');
    const printWindow = window.open('', '', 'height=600,width=800');

    // Write HTML structure for the print version of the seat assignments
    printWindow.document.write('<html><head><title>Seat Assignments</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`

         /*CSS styling for the printed version of the seat assignments table*/
         
        body {
            font-family: 'Fairweather', sans-serif;
        }
        .container-columns {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        .column {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 45%;
            border-radius: 10px;
            border: 0px solid #ccc;
            padding: 10px;
            background-color: #f2f2f2;
        }
        .seat-pair {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            font-weight: bold;
        }
        .column .seat-pair:nth-child(odd) {
            background-color: #e65300;
            -webkit-print-color-adjust: exact;
            color: #fff; 
        }
        .column .seat-pair:nth-child(even) {
            background-color: #ff9900;
            -webkit-print-color-adjust: exact;
            color: #000;
        }
        .seat-pair span {
            margin-right: 10px;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .column {
                background-color: #f2f2f2;
            }
            .column .seat-pair:nth-child(odd) {
                background-color: #e65300;
            }
            .column .seat-pair:nth-child(even) {
                background-color: #ff9900;
            }
        }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(resultDiv.innerHTML); // Copy result to print window
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print(); // Trigger print dialog
}
