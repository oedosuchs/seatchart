<script>
        function assignSeats() {
            const studentNames = document.getElementById('studentNames').value.trim().split('\n').map(name => name.trim()).filter(name => name);
            const totalSeats = parseInt(document.getElementById('totalSeats').value);
            const reservedSeatsInput = document.getElementById('reservedSeats').value.trim().split('\n').map(entry => entry.trim()).filter(entry => entry);
            const reservedSeats = {};

            reservedSeatsInput.forEach(entry => {
                const [name, seat] = entry.split(':').map(item => item.trim());
                reservedSeats[name] = parseInt(seat);
            });

            const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !Object.values(reservedSeats).includes(seat));
            const unassignedStudents = studentNames.filter(name => !reservedSeats[name]);

            if (unassignedStudents.length > availableSeats.length) {
                alert('Not enough seats for all students.');
                return;
            }

            const evenlyDistributedSeats = distributeSeatsEvenly(availableSeats, unassignedStudents.length);
            shuffleArray(evenlyDistributedSeats);
            const seatAssignments = { ...reservedSeats };

            unassignedStudents.forEach((student, index) => {
                seatAssignments[student] = evenlyDistributedSeats[index];
            });

            displayResults(seatAssignments);

            document.getElementById('printButton').style.display = 'block';
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function distributeSeatsEvenly(seats, count) {
            const step = Math.floor(seats.length / count);
            const distributedSeats = [];
            for (let i = 0; i < count; i++) {
                distributedSeats.push(seats[i * step]);
            }
            return distributedSeats;
        }

        function displayResults(seatAssignments) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<hr /> <h2>Seat Assignments</h2>';
        
            const container = document.createElement('div');
            container.classList.add('container-columns');
            
            const column1 = document.createElement('div');
            column1.classList.add('column');
            const column2 = document.createElement('div');
            column2.classList.add('column');
            
            let index = 0;
            
            Object.entries(seatAssignments).forEach(([student, seat], idx) => {
                const seatPair = document.createElement('div');
                seatPair.classList.add('seat-pair');
                seatPair.innerHTML = `<span>${student}</span><span>${seat}</span>`;
        
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

        function printResults() {
            const resultDiv = document.getElementById('result');
            const printWindow = window.open('', '', 'height=600,width=800');
            
            printWindow.document.write('<html><head><title>Seat Assignments</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
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
                }
                .column .seat-pair:nth-child(even) {
                    background-color: #ff9900;
                }
                .seat-pair span {
                    margin-right: 10px;
                }
            `);
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(resultDiv.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    </script>
