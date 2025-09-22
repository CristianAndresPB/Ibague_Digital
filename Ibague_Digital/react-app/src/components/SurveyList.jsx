import React from "react";

const SurveyList = ({ surveys, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="border p-4 rounded shadow hover:bg-blue-50 cursor-pointer"
          onClick={() => onSelect(survey)}
        >
          <h2 className="font-bold text-lg">{survey.title}</h2>
          <p className="text-gray-600">{survey.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SurveyList;
