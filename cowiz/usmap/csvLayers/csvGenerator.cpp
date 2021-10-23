/* To create 

Take meta info file and NY Times daily data file to produce required file

Sep 15, 2020: Change the new case intervals (7 intervals)

Oct 22, 2020: Adding FIPS value to the output .csv files and change date format to DD-MMM-YY

Nov 4, 2020: Change date format from NYTIMES data to YYYY-MM-DD

Nov 12, 2020: Two digit date is required for filename (updated)

*/

#include <iostream>
#include <fstream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <string>

#include <math.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/time.h>
#include <unistd.h>
#include<set>
#include<map>
#include<cmath>


using namespace std;




string month(int mm)
{
	if (mm == 1)
		return "JAN";
	if (mm == 2)
		return "FEB";
	if (mm == 3)
		return "MAR";
	if (mm == 4)
		return "APR";
	if (mm == 5)
		return "MAY";
	if (mm == 6)
		return "JUN";
	if (mm == 7)
		return "JUL";
	if (mm == 8)
		return "AUG";
	if (mm == 9)
		return "SEP";
	if (mm == 10)
		return "OCT";
	if (mm == 11)
		return "NOV";
	if (mm == 12)
		return "DEC";	
}


float percentChange (int startDate1Cases, int startDate2Cases, int endDate1Cases, int endDate2Cases)
{
	float period1Rise = startDate2Cases - startDate1Cases; // increase in period 1
	if (period1Rise < 0)
		period1Rise = 0;

	float period2Rise = endDate2Cases - endDate1Cases; // increase in period 2
	if (period2Rise < 0)
		period2Rise = 0;


	// now calculating the percentage increase in new period
	float percentChange;
	if (period1Rise == 0)
		percentChange = (period2Rise - period1Rise)*100;
	else
		percentChange = ((period2Rise - period1Rise)*100)/period1Rise;

	return percentChange;
}


int percentChangeInterval(float percentChange)
{
	int finalVal = 0;

/*

// OLDER VERSION
	if (percentChange == -100)  // zero new cases
		finalVal = 1;
	if (percentChange > -100 && percentChange <= -50)
		finalVal = 2;
	if (percentChange > -50 && percentChange < 0)
		finalVal = 3;
	if (percentChange == 0)
		finalVal = 4;
	if (percentChange > 0 && percentChange <= 50)
		finalVal = 5;
	if (percentChange > 50 && percentChange <= 100)
		finalVal = 6;
	if (percentChange > 100 && percentChange <= 200)
		finalVal = 7;	
	if (percentChange > 200)
		finalVal = 8;
*/

// NEW UPDATE

	if (percentChange == -100)  // zero new cases
		finalVal = 1;
	if (percentChange > -100 && percentChange <= -50)
		finalVal = 2;
	if (percentChange > -50 && percentChange < 0)
		finalVal = 3;
	if (percentChange == 0)
		finalVal = 4;
	if (percentChange > 0 && percentChange < 50)
		finalVal = 5;
	if (percentChange >= 50 && percentChange < 100)
		finalVal = 6;
	if (percentChange >= 100)
		finalVal = 7;	


/*	if (percentChange > 200 && percentChange <= 300)
		finalVal = 8;	
	if (percentChange > 300 && percentChange <= 400)
		finalVal = 9;	
	if (percentChange > 400 && percentChange <= 500)
		finalVal = 10;
	if (percentChange > 500)
		finalVal = 11;
*/
if (percentChange < -100)
cout<<"\n "<<percentChange;

	return finalVal;
}


char * strtok_single (char * str, char const * delims)
{
  static char  * src = NULL;
  char  *  p,  * ret = 0;

  if (str != NULL)
    src = str;

  if (src == NULL)
    return NULL;

  if ((p = strpbrk (src, delims)) != NULL) {
    *p  = 0;
    ret = src;
    src = ++p;

  } else if (*src) {
    ret = src;
    src = NULL;
  }

  return ret;
}


// Return if year is leap year or not. 
bool isLeap(int y) 
{ 
    if (y%100 != 0 && y%4 == 0 || y %400 == 0) 
        return true; 
  
    return false; 
} 
  
// Given a date, returns number of days elapsed 
// from the  beginning of the current year (1st 
// jan). 
int offsetDays(int d, int m, int y) 
{ 
    int offset = d; 
  
    switch (m - 1) 
    { 
    case 11: 
        offset += 30; 
    case 10: 
        offset += 31; 
    case 9: 
        offset += 30; 
    case 8: 
        offset += 31; 
    case 7: 
        offset += 31; 
    case 6: 
        offset += 30; 
    case 5: 
        offset += 31; 
    case 4: 
        offset += 30; 
    case 3: 
        offset += 31; 
    case 2: 
        offset += 28; 
    case 1: 
        offset += 31; 
    } 
  
    if (isLeap(y) && m > 2) 
        offset += 1; 
  
    return offset; 
} 
  
// Given a year and days elapsed in it, finds 
// date by storing results in d and m. 
void revoffsetDays(int offset, int y, int *d, int *m) 
{ 
    int month[13] = { 0, 31, 28, 31, 30, 31, 30, 
                      31, 31, 30, 31, 30, 31 }; 
  
    if (isLeap(y)) 
        month[2] = 29; 
  
    int i; 
    for (i = 1; i <= 12; i++) 
    { 
        if (offset <= month[i]) 
            break; 
        offset = offset - month[i]; 
    } 
  
    *d = offset; 
    *m = i; 
} 
  
// Add x days to the given date. 
string addDays(int d1, int m1, int y1, int x) 
{ 
    int offset1 = offsetDays(d1, m1, y1); 
    int remDays = isLeap(y1)?(366-offset1):(365-offset1); 
  
    // y2 is going to store result year and 
    // offset2 is going to store offset days 
    // in result year. 
    int y2, offset2; 
    if (x <= remDays) 
    { 
        y2 = y1; 
        offset2 = offset1 + x; 
    } 
  
    else
    { 
        // x may store thousands of days. 
        // We find correct year and offset 
        // in the year. 
        x -= remDays; 
        y2 = y1 + 1; 
        int y2days = isLeap(y2)?366:365; 
        while (x >= y2days) 
        { 
            x -= y2days; 
            y2++; 
            y2days = isLeap(y2)?366:365; 
        } 
        offset2 = x; 
    } 
  
    // Find values of day and month from 
    // offset of result year. 
    int m2, d2; 
    revoffsetDays(offset2, y2, &d2, &m2); 
  
		char new_date[20];
    sprintf(new_date, "%d-%d-%d", d2, m2, y2-2000);
		return new_date;
}


int isBefore(int d1, int m1, int y1, int d2, int m2, int y2)
{

	if (y1 < y2)
		return 1;
	else if (y1 == y2)
	{
		if (m1 < m2)
			return 1;
		else if (m1 == m2)
		{
			if (d1 <= d2)
				return 1;
		}
	}
	return 0;
}


// The previous day
string prevDay(int d1, int m1, int y1)
{
	if  (d1 == 1 && m1 == 1)
	{
		d1 = 31;
		m1 = 12;
		y1 = y1 -1;
	}
	else if (d1 == 1) // for all other 1st day of the months
	{
		if (m1 == 2 || m1 == 4 || m1 == 6 || m1 == 8 || m1 == 9 || m1 == 11)
			d1 = 31;
		if (m1 == 5 || m1 == 7 || m1 == 10 || m1 == 12)
			d1 = 30;
		if (m1 == 3 && isLeap(y1+2000) == true)
			d1 = 29;
		if (m1 == 3 && isLeap(y1+2000) == false)
			d1 = 28;
		m1 = m1 - 1;
	}
	else 
		d1 = d1 - 1;

	char new_date[20];
	sprintf(new_date, "%d-%d-%d", d1, m1, y1);
	
	return new_date;
}




int main()
{
	FILE *f1;
	char info[500], info1[500];
	char *temp1, *temp2;
	int numberOfVertices = 3141;
	int numberOfEdges = 0;
	int numberOfAttr = 9;

	map<int, int> FIPSmap; 
	map<int, int>::iterator it1; 

	map<string, int> DateMap; 
	map<string, int>::iterator it2; 

	string date;

	// start period array: third for original date
	int s_dd[3];
	int s_mm[3];
	int s_yy[3];

	// end period array
	int e_dd[3];
	int e_mm[3];
	int e_yy[3];

        chdir("cowiz/usmap/csvLayers/");

	f1 = fopen("Covid19Period.conf", "r");
	fgets(info, 499, f1);

	// interval
	int interval = atoi(fgets(info, 499, f1));

	// start date	
	fgets(info, 499, f1);
	fgets(info, 499, f1);

//cout<<"\nS = "<<info;

	temp1 = strtok(info, "-");
	s_dd[2] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_mm[2] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_yy[2] =  atoi(temp1);

	sprintf(info, "%s", addDays(s_dd[2], s_mm[2], s_yy[2]+2000, interval-1).c_str());
//cout<<"\nE = "<<info;

	temp1 = strtok(info, "-");
	s_dd[1] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_mm[1] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_yy[1] =  atoi(temp1);
	
	// prev day for the start date cases number
	sprintf(info, "%s", prevDay(s_dd[2], s_mm[2], s_yy[2]).c_str());
	temp1 = strtok(info, "-");
	s_dd[0] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_mm[0] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	s_yy[0] =  atoi(temp1);
	
	// end date
	fgets(info, 499, f1);
	fgets(info, 499, f1);

	temp1 = strtok(info, "-");
	e_dd[2] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_mm[2] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_yy[2] =  atoi(temp1);

	sprintf(info, "%s", addDays(e_dd[2], e_mm[2], e_yy[2]+2000, interval-1).c_str());

	temp1 = strtok(info, "-");
	e_dd[1] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_mm[1] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_yy[1] =  atoi(temp1);


	// prev day for the end period's start
	sprintf(info, "%s", prevDay(e_dd[2], e_mm[2], e_yy[2]).c_str());

	temp1 = strtok(info, "-");
	e_dd[0] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_mm[0] =  atoi(temp1);
	temp1 = strtok(NULL, "-");
	e_yy[0] =  atoi(temp1);


	cout<<"\n Base-Start"<<s_dd[0]<<"-"<<s_mm[0]<<"-"<<s_yy[0];
	cout<<"\n Target-Start"<<e_dd[0]<<"-"<<e_mm[0]<<"-"<<e_yy[0];

/*
	// new cases range: 1 (-100) to 8 (>200)
	fgets(info, 499, f1);
	int newCasesInterval = atoi(fgets(info, 499, f1));
*/

	fclose(f1);

	int periods = 2;	
	int i, j, k;

	float pChange;

	int numberOfFeatures = numberOfAttr + 2*periods + 2; // date 1 and date 2 start end dates; change%; communityID

	char ***data = new char**[numberOfVertices+1];
	for (i = 0; i < numberOfVertices + 1; i++)
		data[i] = new char*[numberOfFeatures];	
	for (i = 0; i < numberOfVertices + 1; i++)
		for (j = 0; j < numberOfFeatures; j++)
			data[i][j] = new char[500];

	for (i = 0; i < numberOfVertices + 1; i++)
		for (j = 0; j < numberOfFeatures; j++)
			sprintf(data[i][j], "%d", 0);
	
	f1 = fopen("data-arxiv-meta-MLN-v2.csv", "r");

	i = 0;
	
	fgets(info, 499, f1);
	while(!feof(f1))
	{	
		info[strlen(info) - 1] = '\0';	
		temp1 = strtok(info, ",");
		j = 0;
		while (temp1 != NULL)
		{
			strcpy(data[i][j], temp1);
			temp1 = strtok(NULL, ",");
			++j;
		}
		FIPSmap.insert(pair<int,int>(atoi(data[i][1]), atoi(data[i][0]) - 1)); // hashmap: <FIPSid, MLNID>; MLN id starts from 0 for array indexing
		fgets(info, 499, f1);
		++i;
	}
	
	fclose(f1);

	f1 = fopen("us-counties.csv", "r");
	
	fgets(info, 499, f1);
	fgets(info, 499, f1);

	int fips, cases, deaths;
	char nd[100];

	int d1, m1, y1;
	i =0;
	while (!feof(f1))
	{
//		cout<<"\n"<<info;	
		info[strlen(info) - 1] = '\0';
		strcpy(nd, strtok(info, ","));
		temp1 = strtok(NULL, ",");
		temp1 = strtok(NULL, ",");
		fips = atoi(strtok(NULL, ","));
		cases = atoi(strtok(NULL, ","));
		temp1 = strtok(NULL, ",");

		if (temp1 == NULL) // invalid input where FIPS does not exist
		{
			fgets(info, 499, f1);
			++i;
			continue;
		}
		else
			deaths = atoi(temp1);

		y1 = atoi(strtok(nd, "-"));
		y1 = y1 % 2000;
		m1 = atoi(strtok(NULL, "-"));
		d1 = atoi(strtok(NULL, "-"));

		it1 = FIPSmap.find(fips);
		if (it1 != FIPSmap.end())
		{	
			if (d1 == s_dd[0] && m1 == s_mm[0] && y1 == s_yy[0])
				sprintf(data[FIPSmap.find(fips)->second + 1][numberOfAttr], "%d", cases); 

			if (d1 == s_dd[1] && m1 == s_mm[1] && y1 == s_yy[1])
				sprintf(data[FIPSmap.find(fips)->second + 1][numberOfAttr+1], "%d", cases); 

			if (d1 == e_dd[0] && m1 == e_mm[0] && y1 == e_yy[0])
				sprintf(data[FIPSmap.find(fips)->second + 1][numberOfAttr+2], "%d", cases); 

			if (d1 == e_dd[1] && m1 == e_mm[1] && y1 == e_yy[1])
				sprintf(data[FIPSmap.find(fips)->second + 1][numberOfAttr+3], "%d", cases); 

		}

		fgets(info, 499, f1);
		++i;

	}
	

	fclose(f1);


	/* ********************* Generation of the required layer ************** */

	char dir[500], layerName[500];
	sprintf(dir, "Cases-%02d-%s-%dvs%02d-%s-%d-intDays%d", s_dd[2], month(s_mm[2]).c_str(), s_yy[2], e_dd[2], month(e_mm[2]).c_str(), e_yy[2], interval);
	struct stat buffer;
	if (stat (dir, &buffer) != 0)
	{
		sprintf(info1, "mkdir %s", dir);	
		system(info1);
	}
	chdir(dir);
/*
	strcpy(info, dir);
	strcat(info, ".intra");
	f1 = fopen(info, "w");

	for (i = 0; i < numberOfVertices; i++)
	{
		sprintf(info, "%d\n", i+1);
		fputs(info, f1);
	}

*/	// check if i and j fall under same interval
	for (i = 0; i < numberOfVertices; i++)
	{
		pChange = percentChange(atoi(data[i+1][numberOfAttr]), atoi(data[i+1][numberOfAttr+1]), atoi(data[i+1][numberOfAttr+2]), atoi(data[i+1][numberOfAttr+3]));
		k = percentChangeInterval(pChange);
		sprintf(data[i+1][numberOfAttr+4], "%.2f", pChange);
		sprintf(data[i+1][numberOfAttr+5], "%d", k);
/*		for (j = i + 1; j < numberOfVertices; j++)
		{
			if ( k == percentChangeInterval(percentChange(atoi(data[j+1][numberOfAttr]), atoi(data[j+1][numberOfAttr+1]), atoi(data[j+1][numberOfAttr+2]), atoi(data[j+1][numberOfAttr+3]))) )
			{
				++numberOfEdges;
				sprintf(info, "%d,%d,%d\n", i+1, j+1, k);
				fputs(info, f1);
			}
		}
*/	}
/*
	fclose(f1);	
	sprintf(info, "sed -i '1s/^/%s\\n%d\\n%d\\n/' %s.intra", dir, numberOfVertices, numberOfEdges, dir);
	system(info);
*/	

	/* ***************** Community Detection with LOUVAIN ******************** */

//	chdir("..");
	

/*
	sprintf(info, "Cases-%d-%d-%dvs%d-%d-%d-intDays%d.meta", s_dd[0], s_mm[0], s_yy[0], e_dd[0], e_mm[0], e_yy[0], interval); 
	sprintf(data[0][numberOfAttr], "%d-%d-%d", s_dd[0], s_mm[0], s_yy[0]); 
	sprintf(data[0][numberOfAttr+1], "%d-%d-%d", s_dd[1], s_mm[1], s_yy[1]); 
	sprintf(data[0][numberOfAttr+2], "%d-%d-%d", e_dd[0], e_mm[0], e_yy[0]); 
	sprintf(data[0][numberOfAttr+3], "%d-%d-%d", e_dd[1], e_mm[1], e_yy[1]); 
	sprintf(data[0][numberOfAttr+4], "CommunityID"); 

	
	f1 = fopen(info, "w");

	for (i = 0; i < numberOfVertices + 1; i++)
	{
		for (j = 0; j < numberOfFeatures - 1; j++)
		{
			sprintf(info, "%s,", data[i][j]);
			fputs(info, f1);
		}
		sprintf(info, "%s\n", data[i][j]);
		fputs(info, f1);
	}
	fclose(f1);
*/

	sprintf(info, "ALL-CommID-Cases-%02d-%s-%dvs%02d-%s-%d-intDays%d.csv", s_dd[2], month(s_mm[2]).c_str(), s_yy[2], e_dd[2], month(e_mm[2]).c_str(), e_yy[2], interval); 
	sprintf(data[0][numberOfAttr], "%d-%d-%d", s_dd[2], s_mm[2], s_yy[2]); 
	sprintf(data[0][numberOfAttr+1], "%d-%d-%d", s_dd[1], s_mm[1], s_yy[1]); 
	sprintf(data[0][numberOfAttr+2], "%d-%d-%d", e_dd[2], e_mm[2], e_yy[2]); 
	sprintf(data[0][numberOfAttr+3], "%d-%d-%d", e_dd[1], e_mm[1], e_yy[1]); 
	sprintf(data[0][numberOfAttr+4], "Change"); 
	sprintf(data[0][numberOfAttr+5], "CommunityID"); 

	
	f1 = fopen(info, "w");

	for (i = 0; i < numberOfVertices + 1; i++)
	{
		if (i == 0 || atoi(data[i][numberOfAttr+3]) > 0)
		{
		for (j = 1; j < numberOfAttr; j++)
		{
			if (j == 1 && i != 0) // fixing FIPS to 5 digits; adding leading zeros
				sprintf(info, "%05d,", atoi(data[i][j]));
			else
				sprintf(info, "%s,", data[i][j]);
			fputs(info, f1);
		}
		sprintf(info, "%s%%,%s\n", data[i][numberOfAttr+4], data[i][numberOfAttr+5]);
		fputs(info, f1);
		}
	}
	fclose(f1);
	for (i = 1; i <= 7; i++)
	{
		sprintf(info, "%d-CommID-%s.csv", i, dir);
		f1 = fopen(info, "w");
		for (j = 0; j < numberOfVertices; j++)
		{
			if (j == 0 || atoi(data[j][numberOfAttr+3]) > 0)
			{
			if (j == 0 || atoi(data[j][numberOfAttr+5]) == i)
			{
				for (k = 1; k < numberOfAttr; k++)
				{
					if (k == 1 && j != 0) // fixing FIPS to 5 digits; adding leading zeros
						sprintf(info, "%05d,", atoi(data[j][k]));
					else
						sprintf(info, "%s,", data[j][k]);
					fputs(info, f1);
				}
				sprintf(info, "%s%%\n", data[j][numberOfAttr+4]);
				fputs(info, f1);
			}
			}			
		}		
		fclose(f1);
	}


}

