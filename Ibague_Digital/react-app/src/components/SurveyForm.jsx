import React, { useState } from "react";

const SurveyForm = ({ survey, onSubmit }) => {
  const [answers, setAnswers] = useState({});

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow">
      <h2 className="text-xl font-bold">{survey.title}</h2>
      {survey.questions.map((q) => (
        <div key={q.id}>
          <label className="block font-medium">{q.text}</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            onChange={(e) => handleChange(q.id, e.target.value)}
          />
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enviar
      </button>
    </form>
  );
};

export default SurveyForm;
