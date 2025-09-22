import React, { useState } from "react";
import SurveyList from "../components/SurveyList";
import SurveyForm from "../components/SurveyForm";
import surveysData from "../data/surveys.json";

const Surveys = () => {
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const handleSelect = (survey) => {
    setSelectedSurvey(survey);
  };

  const handleSubmit = (answers) => {
    console.log("Respuestas enviadas:", answers);
    alert("Gracias por tu participación!");
    setSelectedSurvey(null);
  };

  return (
    <div className="p-8">
      {!selectedSurvey ? (
        <SurveyList surveys={surveysData} onSelect={handleSelect} />
      ) : (
        <SurveyForm survey={selectedSurvey} onSubmit={handleSubmit} />
      )}
    </div>
  );
};

export default Surveys;
