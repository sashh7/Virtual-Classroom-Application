import React, { useEffect, useState } from "react";
import axios from "axios";

const Schedule = ({ studentId, courses }) => {
    const [scheduledClasses, setScheduledClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Prepare course titles to send to the backend
                const courseTitles = courses.map(course => course.title);

                // Make a backend request to fetch schedules related to the courses
                const response = await axios.post(`http://localhost:5001/api/v1/schedule/student`, {
                    courseTitles,
                });

                if (response.data.success) {
                    setScheduledClasses(response.data.classes);
                }
            } catch (error) {
                console.error("Error fetching scheduled classes:", error);
            }
        };

        if (courses.length > 0) {
            fetchClasses();
        }
    }, [courses]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Scheduled Classes</h2>
            {scheduledClasses.length > 0 ? (
                scheduledClasses.map((classItem, index) => (
                    <div
                        key={index}
                        className="bg-[#23273D] p-4 rounded-lg mb-4"
                    >
                        <p> <strong>Subject:</strong> {classItem.subject}</p>
                        <p> <strong>Time:</strong> {new Date(classItem.classTime).toLocaleString()}</p>
                        <a
                            href={classItem.classLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#fe99e8] underline"
                        >
                            Class Link
                        </a>
                    </div>
                ))
            ) : (
                <p className="text-gray-400">No Scheduled Classes Found</p>
            )}
        </div>
    );
};

export default Schedule;
