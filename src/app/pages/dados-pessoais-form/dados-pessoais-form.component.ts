import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CadastroService } from '../../shared/services/cadastro.service';
import { BehaviorSubject, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { Cidade, Estado, IbgeService } from '../../shared/services/ibge.service';
import { cpfValidator } from '../../shared/validators/cpf.validator';
import { emailExistenteValidator } from '../../shared/validators/emailExistente.validator';
import { EmailValidatorService } from '../../shared/services/email-validator.service';
import { DynamicFormService } from '../../shared/services/dynamic-form.service';
import { getDadosPessoaisConfig } from '../../config/dados-pessoais-form.config';
import { FormConfig } from '../../shared/models/form-config.interface';
import { FormFieldBase } from '../../shared/models/form-field-base.interface';

export const senhasIguaisValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmaSenha = control.get('confirmaSenha');

  return senha && confirmaSenha && senha.value === confirmaSenha.value
    ? null
    : { senhasNaoIguais: true };
};

@Component({
  selector: 'app-dados-pessoais-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './dados-pessoais-form.component.html',
  styleUrls: ['./dados-pessoais-form.component.scss']
})
export class DadosPessoaisFormComponent implements OnInit {
  dadosPessoaisForm!: FormGroup;
  formConfig!: FormConfig;

  estados$!: Observable<Estado[]>;
  cidades$!: Observable<Cidade[]>;

  carregandoCidades$ = new BehaviorSubject<boolean>(false);

  constructor(
    private cadastroService: CadastroService,
    private router: Router,
    private ibgeService: IbgeService,
    private emailService: EmailValidatorService,
    private dynamicFormService: DynamicFormService,
  ) {
    this.dynamicFormService.registerFormConfig('dadosPessoais', getDadosPessoaisConfig);
  }

  ngOnInit(): void {
    this.formConfig = this.dynamicFormService.getFormConfig('dadosPessoais', this.emailService);

    const formOptions: AbstractControlOptions = {
      validators: senhasIguaisValidator
    };

this.dadosPessoaisForm = this.dynamicFormService.createFormGroup(
      this.formConfig,
      { validators: senhasIguaisValidator }
    );

    this.carregarEstados();
    this.configurarListenerEstado();
  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/area-atuacao']);
  }

  onProximo(): void {
    if (this.dadosPessoaisForm.valid) {
      this.salvarDadosAtuais();
      this.router.navigate(['/cadastro/perfil']);
    } else {
      this.dadosPessoaisForm.markAllAsTouched();
    }
  }

  isFieldType(field: FormFieldBase, type: string): boolean {
    return field.type === type;
  }

  private salvarDadosAtuais(): void {
    const formValue = this.dadosPessoaisForm.value;
    this.cadastroService.updateCadastroData({
      nomeCompleto: formValue.nomeCompleto,
      estado: formValue.estado,
      cidade: formValue.cidade,
      email: formValue.email,
      senha: formValue.senha
    });
  }

  private carregarEstados(): void {
    this.estados$ = this.ibgeService.getEstados();
  }

  private configurarListenerEstado(): void {
    const estadoControl = this.dadosPessoaisForm.get('estado');

    if (estadoControl) {
      this.cidades$ = estadoControl.valueChanges.pipe(
        startWith(''),
        tap(() => {
          this.resetarCidade();
          this.carregandoCidades$.next(true);
        }),
        switchMap(uf => {
          if (uf) {
            return this.ibgeService.getCidadesPorEstado(uf).pipe(
              tap(() => this.carregandoCidades$.next(false))
            );
          }
          this.carregandoCidades$.next(false);
          return of([]);
        })
      );
    }
  }

  private resetarCidade(): void {
    this.dadosPessoaisForm.get('cidade')?.setValue('');
  }
}
