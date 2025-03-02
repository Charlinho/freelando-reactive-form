
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CadastroService } from '../../shared/services/cadastro.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Habilidade } from '../../shared/models/habilidade.interface';


@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss']
})
export class PerfilFormComponent implements OnInit {
  perfilForm!: FormGroup;
  fotoPreview: string | ArrayBuffer | undefined;

  habilidades: Habilidade[] = [
    { nome: 'Fullstack', selecionada: false },
    { nome: 'Front-end', selecionada: false },
    { nome: 'React', selecionada: false },
    { nome: 'Angular', selecionada: false }
  ];

  niveisIdioma: string[] = [
    'Básico',
    'Intermediário',
    'Avançado',
    'Fluente',
    'Nativo'
  ];

  idiomas: string[] = [
    'Português',
    'Inglês',
    'Espanhol'
  ];

  constructor(
    private fb: FormBuilder,
    private cadastroService: CadastroService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/dados-pessoais']);
  }

  onProximo(): void {
    if (this.perfilForm.valid) {
      this.salvarDadosAtuais();
      this.router.navigate(['/cadastro/confirmacao']);
    }
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      foto: [''],
      resumo: ['', [Validators.required, Validators.maxLength(70)]],
      habilidadesSelecionadas: [[]],
      idiomas: this.fb.array([]),
      portfolio: [''],
      linkedin: ['']
    });
  }

  private salvarDadosAtuais(): void {
    const formValue = this.perfilForm.value;

    this.cadastroService.updateCadastroData({
      foto: this.fotoPreview,
      resumo: formValue.resumo,
      habilidadesSelecionadas: formValue.habilidadesSelecionadas,
      idiomas: [],
      portfolio: formValue.portfolio,
      linkedin: formValue.linkedin
    });
  }
}
