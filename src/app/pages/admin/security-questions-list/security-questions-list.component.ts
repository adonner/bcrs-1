/*
============================================
; Title: security-question-list.component
; Author: Troy Martin
; Date: 01/09/2020
; Modified By: Troy Martin
; Description: List of security questions to manage
;===========================================
*/
// imports from the angular core module
import { Component, OnInit, ViewChild } from '@angular/core';
// imports our custom security question service
import { SecurityQuestionService } from '../../../shared/services/security-question.service';
// imports our custom security question model
import { SecurityQuestion } from '../../../models/security-question.model';
import { MatDialog } from '@angular/material';
// tslint:disable-next-line: max-line-length
import { SecurityQuestionCreateDialogComponent } from '../../../dialogs/security-question-create-dialog/security-question-create-dialog.component';
import { ConfirmationDialogComponent } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { SecurityQuestionEditDialogComponent } from 'src/app/dialogs/security-question-edit-dialog/security-question-edit-dialog.component';

// declare the component
@Component({
  // define the html template file
  templateUrl: './security-questions-list.component.html',
  // define the css for the component
  styleUrls: ['./security-questions-list.component.css']
})
// declare and export the component class
export class SecurityQuestionsListComponent implements OnInit {

  // declare a local question array to bind to the table
  questions: SecurityQuestion[] = [];
  // declare the columns to display in the table
  displayedColumns: string[] = ['text', 'functions'];
  // an array to store the original list of questions
  allQuestions: SecurityQuestion[];
  // the current filter value
  filterValue: string;

  /*
  ; Params: none
  ; Response: none
  ; Description: default constructor
  */
  constructor(private questionService: SecurityQuestionService, private dialog: MatDialog) {}

  /*
  ; Params: none
  ; Response: none
  ; Description: Initialize the component
  */
  ngOnInit() {
    this.questionService.getAll().subscribe(questions => {
      this.questions = questions;
    });
  }

  /*
  ; Params: none
  ; Response: none
  ; Description: Clear the current filter value and reset the collection
  */
  onClear(): void {
    this.filterValue = '';
    this.onKeyUp(this.filterValue);
  }

  /*
  ; Params: none
  ; Response: none
  ; Description: On key up filter the question list
  */
  onKeyUp(value: string): void {
    // if we have 3 or more characters start filtering the list
    if (value && value.length >= 3) {
      // save the full collection so we do not round trip to server
      if (!this.allQuestions) {
        // set the question list
        this.allQuestions = this.questions;
      }

      // use the array filter function to filter the questions
      this.questions = this.questions.filter(x => {
        // return true if the question contains the value
        return x.text.indexOf(value) >= 0;
      });
    } else {
      // since there is not a valid value show all questions
      if (this.allQuestions) {
        this.questions = this.allQuestions;
        // clear the array
        this.allQuestions = null;
      }
    }
  }

  /*
  ; Params: none
  ; Response: none
  ; Description: Add a new question
  */
  addQuestion(): void {
    // declare and create the material dialog using the customer order dialog component
    const dialogRef = this.dialog.open(SecurityQuestionCreateDialogComponent, {
      width: '40%', // options to control height and width of dialog
      disableClose: true, // the user cannot click in the overlay to close
    });

    // subscribe to the after closed event
    dialogRef.afterClosed().subscribe(result => {
      // result should be the value to add
      console.log('The dialog was closed');
    });
  }

  /*
  ; Params: id: string
  ; Response: none
  ; Description: edit an existing question
  */
  editQuestion(id: string): void {
        // find the question the user wants to delete
        const question = this.questions.find((x) => {
          // match the value with the question id
          return x._id === id;
        });

  const dialogRef = this.dialog.open(SecurityQuestionEditDialogComponent, {
    width: '40%', // options to control height and width of dialog
    disableClose: true, // the user cannot click in the overlay to close
    // pass the title and message to the dialog
    data: {questionId: id, question: question.text}
  });
  }
  /*
  ; Params: id: string
  ; Response: none
  ; Description: delete a question
  */
  deleteQuestion(id: string): void {
    // find the question the user wants to delete
    const question = this.questions.find((x) => {
      // match the value with the question id
      return x._id === id;
    });

    // declare and create the material dialog using the customer order dialog component
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '40%', // options to control height and width of dialog
      disableClose: true, // the user cannot click in the overlay to close
      // pass the title and message to the dialog
      data: {dialogTitle: 'Delete security question', message: `Delete security question ${question.text}`}
    });

    // subscribe to the after closed event
    dialogRef.afterClosed().subscribe(result => {
      // if true delete the question from the db
      if (result) {
        // soft delete the question from the database
        this.questionService.delete(id).subscribe((isDisabled) => {
          if (isDisabled) {
            // filter the question from the existing list to save trip to server
            this.questions = this.questions.filter((x) => {
              // match the value with the question id
              return x._id !== id;
            });
          }
        }, (err) => {
          // log the error to the console
          console.log(err);

        }, () => {
          // log complete to the console
          console.log('delete security question complete');
        });


      }
    });
  }
}
