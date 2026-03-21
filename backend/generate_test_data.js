const xlsx = require('xlsx');

// Master Prompt constraints: N=28 students
const generateDummyData = () => {
    const data = [];
    for (let i = 1; i <= 28; i++) {
        const id = `S${i.toString().padStart(2, '0')}`;
        const score_d1 = parseFloat((Math.random() * 2 + 2).toFixed(1)); // 2.0 - 4.0
        const score_final = parseFloat((Math.random() * 1.5 + score_d1).toFixed(1)); // Improvement
        const gain = parseFloat((score_final - score_d1).toFixed(1));
        
        data.push({
            student_id: id,
            name: `Student ${i}`,
            email: `student${i}@university.edu`,
            assignment_views: Math.floor(Math.random() * 20 + 5),
            resource_access_count: Math.floor(Math.random() * 15 + 2),
            rubric_views: Math.floor(Math.random() * 8 + 0),
            time_on_task: Math.floor(Math.random() * 240 + 30),
            revision_frequency: Math.floor(Math.random() * 5 + 0),
            feedback_views: Math.floor(Math.random() * 5 + 0),
            help_seeking_messages: Math.floor(Math.random() * 6 + 0),
            word_count: Math.floor(Math.random() * 300 + 100),
            error_density: parseFloat((Math.random() * 10).toFixed(2)),
            cohesion_index: Math.floor(Math.random() * 5 + 1),
            cohesion: parseFloat((Math.random() * 3 + 2).toFixed(1)),
            ttr: parseFloat((Math.random() * 0.4 + 0.3).toFixed(2)),
            argumentation: parseFloat((Math.random() * 3 + 2).toFixed(1)),
            grammar_accuracy: parseFloat((Math.random() * 3 + 2).toFixed(1)),
            lexical_resource: parseFloat((Math.random() * 3 + 2).toFixed(1)),
            total_score: score_final * 5, // Scaling up to 25 if needed, or keeping it as is
            score_gain: gain,
            first_access_delay_minutes: Math.floor(Math.random() * 60 + 5),
            sample_text: "According to recent studies, the integration of technology in classrooms suggests a significant improvement in student engagement. Furthermore, educators demonstrate that consistent feedback loops are essential."
        });
    }
    return data;
};

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(generateDummyData());
xlsx.utils.book_append_sheet(wb, ws, "CohortData");
const filename = 'Cohort_Writing_Data.xlsx';
xlsx.writeFile(wb, filename);

console.log(`Generated ${filename} with 28 synthetic student records containing all AI engine variables.`);
