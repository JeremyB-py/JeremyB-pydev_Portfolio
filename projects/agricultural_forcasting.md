# Agricultural Forecasting Dashboard

A data science project focused on forecasting crop yields using regression and ARIMA time-series modeling.  
The goal was to analyze seasonal patterns, identify key predictors, and build models capable of predicting future production based on historical agricultural data.  

---

## Overview
The **Agricultural Forecasting Dashboard** combines exploratory data analysis, regression modeling, and visual forecasting into a single, interactive workflow.

This project demonstrates the end-to-end data science process:
- Data cleaning and preprocessing (handling missing values, normalizing units).  
- Exploratory Data Analysis (EDA) with descriptive statistics and correlation heatmaps.  
- Model selection and tuning using ARIMA(p,d,q) and regression baselines.  
- Visualizing results with time-series plots and confidence intervals.  

It was built as part of a larger research goal to apply data-driven insights to agricultural decision-making and resource allocation.

---

## Features
| Category | Description |
|-----------|-------------|
| **EDA & Visualization** | Trend analysis, seasonal decomposition, outlier detection. |
| **ARIMA Forecasting** | Optimized model selection with `find_best_arima_orders()` custom function. |
| **Regression Models** | Linear regression and comparison with ARIMA to evaluate accuracy. |
| **Performance Metrics** | RMSE, MAE, and R² scoring for validation. |
| **Multi-Crop Extension** | Modular functions to extend forecasting to other crops or regions. |

---

## Tech Stack
- **Languages:** Python  
- **Libraries:** Pandas, NumPy, Matplotlib, Statsmodels, Scikit-Learn  
- **Tools:** Jupyter Notebook, VS Code, Git  
- **Workflow:** Data Cleaning → EDA → Modeling → Visualization → Evaluation  

---

## Highlights
- Developed automated ARIMA tuning loops (`p`, `d`, `q` search grid).  
- Implemented data grouping logic for multi-crop comparison.  
- Visualized forecasts with confidence intervals and error bands.  
- Produced reproducible results and exportable figures for presentations.  
- Designed modular functions for integration into future data pipelines.  

---

## Media
Include visual elements that communicate insight at a glance:
- **Line charts** comparing predicted vs. actual yields.  
- **Heatmaps** showing feature correlations.  
- **ARIMA forecast plots** (with upper/lower confidence intervals).  
*(No proprietary or licensed datasets should be shown.)*

---

## Future Improvements
- Transition to a Streamlit dashboard for live forecasting interaction.  
- Implement data ingestion from real-time sources (NOAA or USDA APIs).  
- Add machine learning ensembles (XGBoost, Random Forest Regressor).  
- Deploy as a hosted web app for non-technical users.  

---

## Skills Demonstrated
- Data Cleaning & Transformation  
- Exploratory Data Analysis (EDA)  
- Time-Series Modeling (ARIMA)  
- Regression Modeling  
- Data Visualization & Interpretation  
- Model Evaluation (RMSE, R², Confidence Intervals)  
- Version Control & Documentation  

---

## Repository 
This open source project can be viewed at:  
[github.com/JeremyB-py/Agricultural_Testing](https://github.com/JeremyB-py/Agricultural_Testing)
